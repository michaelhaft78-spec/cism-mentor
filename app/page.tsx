import { redirect } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOrCreateState } from '@/lib/user-state';
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

  const state = await getOrCreateState(supabase, user.id);

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
    />
  );
}
