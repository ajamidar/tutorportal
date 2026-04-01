-- TutorPortal MVP - scheduling matrix + recurring sessions foundation
-- Run this after 005_subject_level_and_delete_support.sql

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'session_status' and n.nspname = 'public'
  ) then
    create type public.session_status as enum ('scheduled', 'cancelled', 'completed');
  end if;
end
$$;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_recurring boolean not null default false,
  recurring_group_id uuid,
  status public.session_status not null default 'scheduled',
  notes text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_time_window_valid check (end_time > start_time)
);

create index if not exists sessions_tutor_id_start_time_idx
on public.sessions (tutor_id, start_time);

create index if not exists sessions_client_id_start_time_idx
on public.sessions (client_id, start_time);

create index if not exists sessions_recurring_group_id_idx
on public.sessions (recurring_group_id)
where recurring_group_id is not null;

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
before update on public.sessions
for each row
execute procedure public.set_updated_at();

alter table public.sessions enable row level security;

-- Tutors can manage only their own sessions.
drop policy if exists "sessions_select_tutor_own" on public.sessions;
create policy "sessions_select_tutor_own"
on public.sessions
for select
to authenticated
using (auth.uid() = tutor_id);

drop policy if exists "sessions_insert_tutor_own" on public.sessions;
create policy "sessions_insert_tutor_own"
on public.sessions
for insert
to authenticated
with check (auth.uid() = tutor_id);

drop policy if exists "sessions_update_tutor_own" on public.sessions;
create policy "sessions_update_tutor_own"
on public.sessions
for update
to authenticated
using (auth.uid() = tutor_id)
with check (auth.uid() = tutor_id);

drop policy if exists "sessions_delete_tutor_own" on public.sessions;
create policy "sessions_delete_tutor_own"
on public.sessions
for delete
to authenticated
using (auth.uid() = tutor_id);

-- Clients can view only sessions linked to their own roster rows.
drop policy if exists "sessions_select_client_own" on public.sessions;
create policy "sessions_select_client_own"
on public.sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = sessions.client_id
      and cp.client_id = auth.uid()
  )
);
