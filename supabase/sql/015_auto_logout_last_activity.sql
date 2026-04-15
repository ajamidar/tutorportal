-- Auto-logout system: track last activity for 3-day timeout
-- Run this in Supabase SQL Editor.

-- Add last_activity column to profiles table
alter table public.profiles
add column last_activity timestamptz not null default now();

comment on column public.profiles.last_activity is 'Track when the user last had activity. Used for auto-logout after 3 days.';

-- Create an index on last_activity for efficient querying
create index if not exists profiles_last_activity_idx on public.profiles(last_activity);

-- Create a function to update last_activity
create or replace function public.update_last_activity()
returns trigger
language plpgsql
as $$
begin
  new.last_activity = now();
  return new;
end;
$$;

-- Note: Do NOT create a trigger here. The middleware will explicitly update last_activity
-- to have better control over when it's updated (only on successful requests, not on every operation).
