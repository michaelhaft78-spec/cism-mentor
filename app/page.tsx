import { redirect } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOrCreateState } from '@/lib/user-state';
import { withTodaySnapshot } from '@/lib/state';
import type { Briefing, ChatMessage } from '@/lib/types';

export const dynamic = 'force-dynamic';

function daysUntil(dateStr: string) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date());
  const ms = Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) : null;
}

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const missingEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'GEMINI_API_KEY'].filter(
    (k) => !process.env[k],
  );
  let state;
  try {
    state = await getOrCreateState(supabase, user.id);
  } catch (e) {
    return <SetupError message={e instanceof Error ? e.message : String(e)} missingEnv={missingEnv} />;
  }

  const [{ data: briefing }, { data: messages }] = await Promise.all([
    supabase
      .from('weekly_intel_briefings')
      .select('id, week_label, briefing_markdown, sources, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <Dashboard
      email={user.email ?? ''}
      initialState={state}
      daysLeft={daysUntil(state.user_profile.target_exam_date)}
      briefing={(briefing as Briefing) ?? null}
      initialMessages={((messages ?? []) as ChatMessage[]).reverse()}
      fallbackHistory={withTodaySnapshot(state).progress_history ?? []}
    />
  );
}

/** Leesbare foutmelding i.p.v. een generieke "server error" tijdens de setup. */
function SetupError({ message, missingEnv }: { message: string; missingEnv: string[] }) {
  const tableMissing = /does not exist|schema cache|relation/i.test(message);
  const noPermission = /permission denied|row-level security/i.test(message);
  return (
    <main className="login">
      <div className="card login-card" style={{ maxWidth: 560 }}>
        <h1>Setup nog niet compleet</h1>
        <p className="warn">{message}</p>
        {missingEnv.length > 0 && (
          <p>
            Ontbrekende variabelen in Vercel: <strong>{missingEnv.join(', ')}</strong>. Voeg ze toe onder Settings →
            Environment Variables en doe daarna een Redeploy.
          </p>
        )}
        {tableMissing && (
          <p>
            De tabellen bestaan nog niet. Plak <code>supabase/schema.sql</code> in Supabase → SQL Editor en klik Run.
          </p>
        )}
        {noPermission && (
          <p>
            Geen toegang tot de tabellen. Draai <code>supabase/schema.sql</code> opnieuw in de SQL Editor (de nieuwste
            versie bevat de benodigde rechten).
          </p>
        )}
        <form action="/auth/signout" method="post">
          <button className="ghost" type="submit">Uitloggen</button>
        </form>
      </div>
    </main>
  );
}
