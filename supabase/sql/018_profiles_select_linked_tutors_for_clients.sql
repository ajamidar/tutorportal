-- Allow clients to read tutor profile rows linked through their roster entries.
-- Needed for payment receipt payee details in the client portal.

drop policy if exists "profiles_select_linked_tutors_for_clients" on public.profiles;
create policy "profiles_select_linked_tutors_for_clients"
on public.profiles
for select
to authenticated
using (
  role = 'tutor'
  and exists (
    select 1
    from public.client_profiles cp
    where cp.tutor_id = profiles.id
      and cp.client_id = auth.uid()
  )
);
