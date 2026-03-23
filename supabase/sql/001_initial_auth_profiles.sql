-- TutorPortal MVP - Initial auth + profiles schema
-- Run this in Supabase SQL Editor.

-- 1) Custom enum for user roles
create type public.user_role as enum ('tutor', 'client');

-- 2) Profiles table linked 1:1 with auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App profile + role metadata for each authenticated user.';
comment on column public.profiles.id is 'Matches auth.users.id (Supabase Auth user id).';

-- 3) Keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

-- 4) Foundational RLS policies
alter table public.profiles enable row level security;

-- Users can view only their own profile.
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Users can insert only their own profile.
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Users can update only their own profile.
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- No delete policy for now.

-- Optional but useful for lookup speed (id is already PK).
create index if not exists profiles_role_idx on public.profiles(role);
