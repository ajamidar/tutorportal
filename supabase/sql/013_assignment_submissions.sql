-- TutorPortal - Assignment submissions and feedback
-- Allows students to submit work and tutors to provide feedback/marks

create type public.submission_status as enum ('pending', 'submitted', 'marked');

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  client_profile_id uuid not null references public.client_profiles(id) on delete cascade,
  submitted_file_path text,
  submitted_date timestamptz,
  submission_status public.submission_status not null default 'pending',
  feedback_text text,
  feedback_pdf_path text,
  marks integer,
  marked_date timestamptz,
  marked_by_tutor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, client_profile_id)
);

create index if not exists assignment_submissions_assignment_id_idx
on public.assignment_submissions (assignment_id);

create index if not exists assignment_submissions_client_profile_id_idx
on public.assignment_submissions (client_profile_id);

create index if not exists assignment_submissions_status_idx
on public.assignment_submissions (submission_status);

drop trigger if exists assignment_submissions_set_updated_at on public.assignment_submissions;
create trigger assignment_submissions_set_updated_at
before update on public.assignment_submissions
for each row
execute procedure public.set_updated_at();

alter table public.assignment_submissions enable row level security;

-- Constraint: feedback text must not exceed 500 characters
alter table public.assignment_submissions
add constraint feedback_text_max_length check (char_length(feedback_text) <= 500);

-- RLS Policies

-- Students can view and submit for their own assignments
drop policy if exists "submissions_select_student_own" on public.assignment_submissions;
create policy "submissions_select_student_own"
on public.assignment_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = assignment_submissions.client_profile_id
      and cp.client_id = auth.uid()
  )
);

-- Students can insert submissions for their own assignments
drop policy if exists "submissions_insert_student_own" on public.assignment_submissions;
create policy "submissions_insert_student_own"
on public.assignment_submissions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.client_profiles cp
    join public.assignments a on a.client_id = cp.id
    where cp.id = assignment_submissions.client_profile_id
      and cp.client_id = auth.uid()
      and a.id = assignment_submissions.assignment_id
  )
);

-- Students can update (submit) their own submissions via stored procedure only
-- Direct update is blocked; use RPC instead

-- Tutors can view all submissions for their assignments
drop policy if exists "submissions_select_tutor_own" on public.assignment_submissions;
create policy "submissions_select_tutor_own"
on public.assignment_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and a.tutor_id = auth.uid()
  )
);

-- Tutors can update (mark) submissions for their assignments
drop policy if exists "submissions_update_tutor_own" on public.assignment_submissions;
create policy "submissions_update_tutor_own"
on public.assignment_submissions
for update
to authenticated
using (
  exists (
    select 1
    from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and a.tutor_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and a.tutor_id = auth.uid()
  )
);

-- Add storage bucket for student submissions
insert into storage.buckets (id, name, public)
values ('student_submissions', 'student_submissions', false)
on conflict (id) do update set public = excluded.public;

-- Students can upload submissions to their own folder
drop policy if exists "student_submissions_insert_student_own" on storage.objects;
create policy "student_submissions_insert_student_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student_submissions'
  and (auth.uid()::text || '/') = ((string_to_array(name, '/'))[1] || '/')
);

-- Students can read their own submissions
drop policy if exists "student_submissions_select_student_own" on storage.objects;
create policy "student_submissions_select_student_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student_submissions'
  and (auth.uid()::text || '/') = ((string_to_array(name, '/'))[1] || '/')
);

-- Tutors can upload feedback PDFs to their own folder (feedback/)
drop policy if exists "student_submissions_insert_tutor_own" on storage.objects;
create policy "student_submissions_insert_tutor_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student_submissions'
  and (string_to_array(name, '/'))[1] = 'feedback'
  and (auth.uid()::text || '/') = ((string_to_array(name, '/'))[2] || '/')
);

-- Tutors can read their own feedback files
drop policy if exists "student_submissions_select_tutor_feedback" on storage.objects;
create policy "student_submissions_select_tutor_feedback"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student_submissions'
  and (string_to_array(name, '/'))[1] = 'feedback'
  and (auth.uid()::text || '/') = ((string_to_array(name, '/'))[2] || '/')
);
