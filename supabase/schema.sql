-- =====================================================================
-- CISM Mentor - database schema
-- Plak dit volledige bestand in Supabase -> SQL Editor -> New query -> Run
-- =====================================================================

-- 1. Voortgang (0-100), error analytics en intel-log als één JSON-object
create table if not exists public.user_cism_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state_data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- 2. Wekelijkse web-intelligence briefings
create table if not exists public.weekly_intel_briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_label text not null,
  briefing_markdown text not null,
  sources jsonb,
  created_at timestamp with time zone default now()
);
create index if not exists weekly_intel_briefings_user_created_idx
  on public.weekly_intel_briefings (user_id, created_at desc);

-- 3. Chatgeschiedenis (zodat de mentor weet welke vraag hij net stelde)
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'model')),
  content text not null,
  created_at timestamp with time zone default now()
);
create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);

-- =====================================================================
-- Row Level Security: elke gebruiker ziet en wijzigt alleen eigen rijen.
-- (De cron-job gebruikt de service role key en omzeilt RLS bewust.)
-- =====================================================================
alter table public.user_cism_state enable row level security;
alter table public.weekly_intel_briefings enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "own state select" on public.user_cism_state;
drop policy if exists "own state insert" on public.user_cism_state;
drop policy if exists "own state update" on public.user_cism_state;
create policy "own state select" on public.user_cism_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own state insert" on public.user_cism_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own state update" on public.user_cism_state
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own briefings select" on public.weekly_intel_briefings;
drop policy if exists "own briefings insert" on public.weekly_intel_briefings;
create policy "own briefings select" on public.weekly_intel_briefings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own briefings insert" on public.weekly_intel_briefings
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "own messages select" on public.chat_messages;
drop policy if exists "own messages insert" on public.chat_messages;
drop policy if exists "own messages delete" on public.chat_messages;
create policy "own messages select" on public.chat_messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own messages insert" on public.chat_messages
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own messages delete" on public.chat_messages
  for delete to authenticated using ((select auth.uid()) = user_id);
