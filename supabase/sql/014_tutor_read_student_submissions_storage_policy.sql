-- TutorPortal - allow tutors to read student-submitted files for their own assignments
-- Run this after 013_assignment_submissions.sql

-- Tutors need select access to student submission objects so server-side signed URLs can be created.
drop policy if exists "student_submissions_select_tutor_submitted_files" on storage.objects;
create policy "student_submissions_select_tutor_submitted_files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student_submissions'
  and exists (
    select 1
    from public.assignment_submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.submitted_file_path = storage.objects.name
      and a.tutor_id = auth.uid()
  )
);
