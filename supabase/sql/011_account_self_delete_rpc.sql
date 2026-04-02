-- TutorPortal MVP - self-service account deletion RPC
-- Run this after 010_assignments_storage_foundation.sql

create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete from auth.users; public.profiles references auth.users(id) with ON DELETE CASCADE.
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_current_user() from public;
grant execute on function public.delete_current_user() to authenticated;
