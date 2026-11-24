import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { generateWithFallback } from './gemini';
import { MASTER_SYSTEM_PROMPT } from './master-prompt';
import { DOMAIN_KEYS, parseLooseJson, splitTaggedBlock } from './state';
import { getOrCreateState, saveState } from './user-state';
import type { IntelLogEntry } from './types';

const todayInAmsterdam = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date()); // YYYY-MM-DD

function buildPrompt(stateJson: string) {
  return `
Voer MODUS 2 (WEKELIJKSE WEB-INTELLIGENCE & CONTEXT BRIEFING) uit.
Zoek op het web naar de 3 belangrijkste ontwikkelingen van de afgelopen 7 dagen op het gebied van:
1. Grote datalekken of ransomware-aanvallen (en de governance/incident response lessen).
2. Europese en Nederlandse wet- en regelgeving (NIS2 / Cyberbeveiligingswet, DORA, AI Act).
3. Nieuwe kritieke kwetsbaarheden of CISO-trendrapporten.

Koppel elk item expliciet aan één van de 4 CISM-domeinen en leg uit hoe een CISM-manager hiernaar kijkt.
Gebruik per item de kopjes "Wat gebeurde er?" en "Hoe kijkt een CISM-manager hiernaar?".
Leg waar mogelijk een link met de zwakke onderwerpen uit de gebruikersstatus hieronder.
Sluit af met één examen-tip ("Wat betekent dit voor een FIRST/BEST/MOST-vraag?").

BELANGRIJK voor dit automatische verzoek:
- Geef GEEN <STATE_UPDATE>-blok terug.
- Sluit in plaats daarvan af met een blok <INTEL_LOG>...</INTEL_LOG> met daarin puur een JSON-array van precies 3 objecten:
  [{"topic": "korte titel", "linked_domain": "domain_1_governance" | "domain_2_risk_management" | "domain_3_security_program" | "domain_4_incident_management"}]

<USER_STATE>
${stateJson}
</USER_STATE>
`.trim();
}

type Source = { title?: string; uri?: string };

export async function generateWeeklyBriefing(supabase: SupabaseClient, userId: string) {
  const state = await getOrCreateState(supabase, userId);

  const response = await generateWithFallback({
    contents: buildPrompt(JSON.stringify(state, null, 2)),
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
    },
  });

  const rawText = response.text || '';
  // Mocht het model toch een STATE_UPDATE geven: weghalen, niet toepassen.
  const withoutState = splitTaggedBlock(rawText, 'STATE_UPDATE').visible;
  const { visible: briefingMarkdown, block: logBlock } = splitTaggedBlock(withoutState, 'INTEL_LOG');
  if (!briefingMarkdown) throw new Error('Gemini gaf een lege briefing terug');

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources: Source[] = chunks
    .map((c) => ({ title: c.web?.title, uri: c.web?.uri }))
    .filter((s) => s.uri);

  const date = todayInAmsterdam();

  let newEntries: IntelLogEntry[] = [];
  if (logBlock) {
    try {
      const parsed = parseLooseJson(logBlock);
      if (Array.isArray(parsed)) {
        newEntries = parsed
          .filter((x: any) => x && typeof x.topic === 'string')
          .slice(0, 3)
          .map((x: any) => ({
            date,
            topic: x.topic,
            linked_domain: DOMAIN_KEYS.includes(x.linked_domain) ? x.linked_domain : 'domain_1_governance',
            completed: false,
          }));
      }
    } catch (e) {
      console.error('INTEL_LOG kon niet worden geparsed:', e);
    }
  }
  if (newEntries.length === 0) {
    newEntries = [{ date, topic: 'Wekelijkse intel-briefing', linked_domain: 'domain_1_governance', completed: false }];
  }

  const { error } = await supabase.from('weekly_intel_briefings').insert({
    user_id: userId,
    week_label: date,
    briefing_markdown: briefingMarkdown,
    sources,
  });
  if (error) throw new Error(`Briefing opslaan mislukt: ${error.message}`);

  // weekly_intel_log in de state bijwerken (laatste 20 items bewaren)
  const updatedState = { ...state, weekly_intel_log: [...state.weekly_intel_log, ...newEntries].slice(-20) };
  await saveState(supabase, userId, updatedState);

  return { week_label: date, topics: newEntries.map((e) => e.topic), sources: sources.length };
}
