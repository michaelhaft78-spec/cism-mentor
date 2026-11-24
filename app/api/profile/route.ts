import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOrCreateState, saveState } from '@/lib/user-state';

/** Examendatum (en later andere profielinstellingen) aanpassen door de ingelogde gebruiker. */
export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const date = typeof body?.target_exam_date === 'string' ? body.target_exam_date : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    return NextResponse.json({ error: 'Ongeldige datum' }, { status: 400 });
  }
  const year = Number(date.slice(0, 4));
  if (year < 2024 || year > 2035) return NextResponse.json({ error: 'Kies een datum tussen 2024 en 2035' }, { status: 400 });

  try {
    const state = await getOrCreateState(supabase, user.id);
    const updated = { ...state, user_profile: { ...state.user_profile, target_exam_date: date } };
    await saveState(supabase, user.id, updated);
    return NextResponse.json({ state: updated });
  } catch (e) {
    console.error('/api/profile fout:', e);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}
