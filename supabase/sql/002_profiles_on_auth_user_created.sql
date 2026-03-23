-- TutorPortal MVP - auto-create profile from auth signup metadata
-- Run this after 001_initial_auth_profiles.sql

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  incoming_role text;
begin
  incoming_role := coalesce(new.raw_user_meta_data ->> 'role', 'client');

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case
      when incoming_role = 'tutor' then 'tutor'::public.user_role
      else 'client'::public.user_role
    end,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set role = excluded.role,
        full_name = excluded.full_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
