-- TutorPortal MVP - support multiple subjects + level + delete
-- Run this after 004.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'academic_level' and n.nspname = 'public'
  ) then
    create type public.academic_level as enum ('gcse', 'a_level');
  end if;
end
$$;

alter table public.client_profiles
add column if not exists subject text;

update public.client_profiles
set subject = coalesce(subject, 'General')
where subject is null;

alter table public.client_profiles
alter column subject set not null;

alter table public.client_profiles
add column if not exists level public.academic_level;

update public.client_profiles
set level = coalesce(level, 'gcse'::public.academic_level)
where level is null;

alter table public.client_profiles
alter column level set not null;

alter table public.client_profiles
drop constraint if exists client_profiles_tutor_id_client_id_student_name_key;

alter table public.client_profiles
add constraint client_profiles_unique_subject_enrolment
unique (tutor_id, client_id, student_name, subject, level);

drop policy if exists "client_profiles_delete_tutor_own" on public.client_profiles;
create policy "client_profiles_delete_tutor_own"
on public.client_profiles
for delete
to authenticated
using (auth.uid() = tutor_id);
