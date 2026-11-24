import { NextResponse } from 'next/server';
import { describeGeminiError, generateWithFallback } from '@/lib/gemini';
import { MASTER_SYSTEM_PROMPT } from '@/lib/master-prompt';
import { normalizeState, parseLooseJson, splitTaggedBlock } from '@/lib/state';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOrCreateState, saveState } from '@/lib/user-state';

export const maxDuration = 300; // Gemini kan bij lange antwoorden of drukte ruim een minuut nodig hebben

const HISTORY_LIMIT = 20; // laatste 20 berichten als context

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // De gebruiker komt ALTIJD uit de sessie, nooit uit de request body.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const userMessage = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!userMessage) return NextResponse.json({ error: 'Leeg bericht' }, { status: 400 });
  if (userMessage.length > 8000) return NextResponse.json({ error: 'Bericht is te lang' }, { status: 400 });

  try {
    // 1. Huidige state + recente chatgeschiedenis ophalen
    const currentState = await getOrCreateState(supabase, user.id);
    const { data: historyRows } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT);
    const history = (historyRows ?? []).reverse();

    // 2. State onder het nieuwe bericht injecteren
    const enrichedPrompt = `${userMessage}\n\n<USER_STATE>\n${JSON.stringify(currentState, null, 2)}\n</USER_STATE>`;

    // 3. Gemini aanroepen met de Master Prompt
    const response = await generateWithFallback({
      contents: [
        ...history.map((m) => ({ role: m.role as 'user' | 'model', parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: enrichedPrompt }] },
      ],
      config: {
        systemInstruction: MASTER_SYSTEM_PROMPT,
        temperature: 0.4,
      },
    });

    const rawText = response.text || '';

    // 4. Zichtbare coaching scheiden van de <STATE_UPDATE> JSON
    const { visible, block } = splitTaggedBlock(rawText, 'STATE_UPDATE');
    const visibleReply = visible || '_(Geen antwoord ontvangen, probeer het opnieuw.)_';

    let updatedState = currentState;
    let stateWarning: string | null = null;
    if (block) {
      try {
        updatedState = normalizeState(parseLooseJson(block), currentState);
      } catch (e) {
        console.error('STATE_UPDATE kon niet worden geparsed:', e, block.slice(0, 500));
        stateWarning = 'De voortgang kon deze keer niet worden bijgewerkt (ongeldige JSON van het model). Je vorige stand is bewaard.';
      }
    } else {
      stateWarning = 'Het model gaf geen STATE_UPDATE terug. Je vorige stand is bewaard.';
    }

    // 5. Opslaan: bijgewerkte voortgang + chatberichten
    if (updatedState !== currentState) await saveState(supabase, user.id, updatedState);
    await supabase.from('chat_messages').insert([
      { user_id: user.id, role: 'user', content: userMessage },
      { user_id: user.id, role: 'model', content: visibleReply },
    ]);

    return NextResponse.json({ reply: visibleReply, state: updatedState, stateWarning });
  } catch (e) {
    console.error('/api/chat fout:', e);
    return NextResponse.json({ error: describeGeminiError(e) }, { status: 500 });
  }
}

/** Nieuw gesprek: wist de chatgeschiedenis (voortgang blijft staan). */
export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  await supabase.from('chat_messages').delete().eq('user_id', user.id);
  return NextResponse.json({ ok: true });
}
