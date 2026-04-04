-- Prevent tutors from having overlapping scheduled sessions.
-- Run this after 011_client_profiles_client_select_policy.sql.

create extension if not exists btree_gist;

alter table public.sessions
drop constraint if exists sessions_tutor_no_overlap;

alter table public.sessions
add constraint sessions_tutor_no_overlap
exclude using gist (
  tutor_id with =,
  tstzrange(start_time, end_time, '[)') with &&
)
where (status = 'scheduled');
