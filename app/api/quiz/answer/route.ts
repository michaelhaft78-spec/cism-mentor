import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOrCreateState, saveState } from '@/lib/user-state';
import { getQuestion } from '@/lib/questions';
import { applyQuizAnswer } from '@/lib/quiz';

/** Verwerkt een antwoord op een meerkeuzevraag. Werkt zonder Gemini. */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const q = typeof body?.questionId === 'string' ? getQuestion(body.questionId) : undefined;
  const choice = body?.choice;
  if (!q || !Number.isInteger(choice) || choice < 0 || choice >= q.options.length) {
    return NextResponse.json({ error: 'Ongeldige vraag of keuze' }, { status: 400 });
  }

  try {
    const state = await getOrCreateState(supabase, user.id);
    const result = applyQuizAnswer(state, q, choice);
    await saveState(supabase, user.id, result.state);
    return NextResponse.json({ correct: result.correct, correctIndex: q.correct, state: result.state });
  } catch (e) {
    console.error('/api/quiz/answer fout:', e);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}
