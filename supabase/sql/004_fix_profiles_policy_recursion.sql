-- Fix recursive RLS policy on profiles introduced in 003 migration.
-- Run this in Supabase SQL Editor.

-- Remove the recursive policy first.
drop policy if exists "profiles_select_clients_for_tutors" on public.profiles;

-- Helper function that checks current user's role without triggering RLS recursion.
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

-- Allow tutors to read client profiles for roster linking.
create policy "profiles_select_clients_for_tutors"
on public.profiles
for select
to authenticated
using (
  role = 'client'
  and public.current_user_is_tutor()
);
