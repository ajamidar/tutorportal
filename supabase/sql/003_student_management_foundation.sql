-- TutorPortal MVP - student management foundation
-- Run this after 001 and 002 migrations.

-- 1) Add email to profiles so tutor actions can look up clients by email
alter table public.profiles
add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is null;

alter table public.profiles
alter column email set not null;

create unique index if not exists profiles_email_unique_idx
on public.profiles (lower(email));

drop policy if exists "profiles_select_clients_for_tutors" on public.profiles;
-- Keep strict self-read, but allow tutors to search/read client profiles for roster linking.
create or replace function public.current_user_is_tutor()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  is_tutor boolean;
begin
  select (p.role = 'tutor') into is_tutor
  from public.profiles p
  where p.id = auth.uid();

  return coalesce(is_tutor, false);
end;
$$;

create policy "profiles_select_clients_for_tutors"
on public.profiles
for select
to authenticated
using (
  role = 'client'
  and public.current_user_is_tutor()
);

-- Keep profiles.email synced with auth.users.email changes.
create or replace function public.sync_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, email, full_name)
  values (
    new.id,
    case
      when coalesce(new.raw_user_meta_data ->> 'role', 'client') = 'tutor'
        then 'tutor'::public.user_role
      else 'client'::public.user_role
    end,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.sync_profile_email_from_auth();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email on auth.users
for each row execute procedure public.sync_profile_email_from_auth();

-- 2) Client profiles table (student roster rows)
create table if not exists public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  student_name text not null,
  exam_board text not null,
  current_working_grade text,
  target_grade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tutor_id, client_id, student_name)
);

drop trigger if exists client_profiles_set_updated_at on public.client_profiles;
create trigger client_profiles_set_updated_at
before update on public.client_profiles
for each row
execute procedure public.set_updated_at();

create index if not exists client_profiles_tutor_id_idx on public.client_profiles(tutor_id);
create index if not exists client_profiles_client_id_idx on public.client_profiles(client_id);

alter table public.client_profiles enable row level security;

-- Tutors can only view/create/update their own roster entries.
drop policy if exists "client_profiles_select_tutor_own" on public.client_profiles;
create policy "client_profiles_select_tutor_own"
on public.client_profiles
for select
to authenticated
using (auth.uid() = tutor_id);

drop policy if exists "client_profiles_insert_tutor_own" on public.client_profiles;
create policy "client_profiles_insert_tutor_own"
on public.client_profiles
for insert
to authenticated
with check (auth.uid() = tutor_id);

drop policy if exists "client_profiles_update_tutor_own" on public.client_profiles;
create policy "client_profiles_update_tutor_own"
on public.client_profiles
for update
to authenticated
using (auth.uid() = tutor_id)
with check (auth.uid() = tutor_id);
