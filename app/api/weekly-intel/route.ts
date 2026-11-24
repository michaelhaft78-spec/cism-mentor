import { NextResponse } from 'next/server';
import { generateWeeklyBriefing } from '@/lib/intel';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const maxDuration = 60;

/**
 * GET: aangeroepen door Vercel Cron (maandag 06:00 UTC = 07:00 Amsterdam in de winter).
 * Vercel stuurt automatisch "Authorization: Bearer <CRON_SECRET>" mee.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = process.env.DEFAULT_USER_ID;
  if (!userId) return NextResponse.json({ error: 'DEFAULT_USER_ID ontbreekt' }, { status: 500 });

  try {
    const result = await generateWeeklyBriefing(createSupabaseAdminClient(), userId);
    return NextResponse.json({ status: 'Briefing gegenereerd en opgeslagen', ...result });
  } catch (e) {
    console.error('weekly-intel cron fout:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** POST: handmatig "Genereer briefing nu" vanuit het dashboard (ingelogde gebruiker). */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  try {
    const result = await generateWeeklyBriefing(supabase, user.id);
    return NextResponse.json({ status: 'ok', ...result });
  } catch (e) {
    console.error('weekly-intel handmatig fout:', e);
    return NextResponse.json({ error: 'Briefing genereren mislukt. Probeer het later opnieuw.' }, { status: 500 });
  }
}
