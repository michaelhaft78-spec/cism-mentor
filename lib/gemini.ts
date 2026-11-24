import 'server-only';
import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';

let client: GoogleGenAI | null = null;

/** Lazy client, zodat een build zonder GEMINI_API_KEY niet faalt. */
export function getGemini() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY ontbreekt in de Vercel Environment Variables.');
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/**
 * Kiest automatisch een werkend model. Google faseert modellen regelmatig uit
 * (zo gaf gemini-2.5-flash een 404), dus we vragen de lijst met beschikbare
 * modellen op bij Google en nemen het nieuwste stabiele Flash-model.
 * Met GEMINI_MODEL in Vercel kun je een vast model afdwingen.
 */
let discovered: string[] | null = null;

const versionOf = (name: string) => {
  const m = name.match(/gemini-(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
};

async function discoverModels(): Promise<string[]> {
  if (discovered) return discovered;
  const names: string[] = [];
  try {
    const pager = await getGemini().models.list();
    for await (const m of pager) {
      const name = (m.name ?? '').replace(/^models\//, '');
      if (!name.startsWith('gemini-')) continue;
      if (m.supportedActions && !m.supportedActions.includes('generateContent')) continue;
      if (/lite|image|tts|audio|live|embedding|robotics|computer-use|thinking-exp|learnlm/i.test(name)) continue;
      names.push(name);
    }
  } catch (e) {
    console.error('Modellen ophalen mislukt:', e);
  }
  // Voorkeur: flash boven pro (sneller/goedkoper), stabiel boven preview/exp, hogere versie eerst.
  const score = (n: string) =>
    (/flash/.test(n) ? 1000 : 0) + (/preview|exp/.test(n) ? 0 : 500) + versionOf(n);
  names.sort((a, b) => score(b) - score(a));
  discovered = names;
  return names;
}

async function candidateModels(): Promise<string[]> {
  const list = [process.env.GEMINI_MODEL, ...(await discoverModels()), 'gemini-flash-latest'];
  return [...new Set(list.filter(Boolean))].slice(0, 6) as string[];
}

const isModelUnavailable = (e: unknown) =>
  /404|not[ _]found|no longer available|is not supported|deprecated/i.test(String((e as Error)?.message ?? e));

/** generateContent met automatische terugval naar het volgende model als een model niet (meer) bestaat. */
export async function generateWithFallback(params: Omit<GenerateContentParameters, 'model'>) {
  let lastError: unknown;
  for (const model of await candidateModels()) {
    try {
      const res = await getGemini().models.generateContent({ ...params, model });
      if (discovered && discovered[0] !== model) discovered = [model, ...discovered.filter((n) => n !== model)];
      return res;
    } catch (e) {
      lastError = e;
      if (!isModelUnavailable(e)) break;
      console.warn(`Gemini-model ${model} niet beschikbaar, probeer volgende.`);
    }
  }
  throw lastError;
}

/** Vertaalt Gemini-fouten naar een begrijpelijke Nederlandse melding. */
export function describeGeminiError(e: unknown): string {
  const msg = String((e as Error)?.message ?? e);
  if (/GEMINI_API_KEY ontbreekt/.test(msg)) return msg;
  if (/api key not valid|API_KEY_INVALID|permission denied|403/i.test(msg))
    return 'De Gemini API-key is ongeldig. Controleer GEMINI_API_KEY in Vercel en doe een Redeploy.';
  if (/429|quota|rate limit|RESOURCE_EXHAUSTED/i.test(msg))
    return 'Het Gemini-tegoed of de limiet per minuut is bereikt. Wacht even en probeer het opnieuw.';
  if (isModelUnavailable(e)) return `Geen bruikbaar Gemini-model gevonden. Details: ${msg.slice(0, 300)}`;
  return `Gemini gaf een fout: ${msg.slice(0, 300)}`;
}
