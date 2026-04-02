-- TutorPortal MVP - allow clients to read their own linked roster rows
-- Run this after 010_assignments_storage_foundation.sql

drop policy if exists "client_profiles_select_client_own" on public.client_profiles;
create policy "client_profiles_select_client_own"
on public.client_profiles
for select
to authenticated
using (auth.uid() = client_id);