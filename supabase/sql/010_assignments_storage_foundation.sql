-- TutorPortal MVP - assignments and academic resources storage
-- Run this after 009_profiles_stripe_connect_standard.sql

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'assignment_status' and n.nspname = 'public'
  ) then
    create type public.assignment_status as enum ('pending', 'submitted', 'marked');
  end if;
end
$$;

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  status public.assignment_status not null default 'pending',
  resource_path text not null,
  resource_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignments_tutor_id_due_date_idx
on public.assignments (tutor_id, due_date asc);

create index if not exists assignments_client_id_due_date_idx
on public.assignments (client_id, due_date asc);

drop trigger if exists assignments_set_updated_at on public.assignments;
create trigger assignments_set_updated_at
before update on public.assignments
for each row
execute procedure public.set_updated_at();

alter table public.assignments enable row level security;

-- Tutors can fully manage their own assignments.
drop policy if exists "assignments_select_tutor_own" on public.assignments;
create policy "assignments_select_tutor_own"
on public.assignments
for select
to authenticated
using (auth.uid() = tutor_id);

drop policy if exists "assignments_insert_tutor_own" on public.assignments;
create policy "assignments_insert_tutor_own"
on public.assignments
for insert
to authenticated
with check (auth.uid() = tutor_id);

drop policy if exists "assignments_update_tutor_own" on public.assignments;
create policy "assignments_update_tutor_own"
on public.assignments
for update
to authenticated
using (auth.uid() = tutor_id)
with check (auth.uid() = tutor_id);

drop policy if exists "assignments_delete_tutor_own" on public.assignments;
create policy "assignments_delete_tutor_own"
on public.assignments
for delete
to authenticated
using (auth.uid() = tutor_id);

-- Clients can only view assignments linked to their own roster rows.
drop policy if exists "assignments_select_client_own" on public.assignments;
create policy "assignments_select_client_own"
on public.assignments
for select
to authenticated
using (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = assignments.client_id
      and cp.client_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('academic_resources', 'academic_resources', false)
on conflict (id) do update set public = excluded.public;

-- Tutors can upload files only into their own folder prefix: <tutor_id>/...
drop policy if exists "academic_resources_insert_tutor_own" on storage.objects;
create policy "academic_resources_insert_tutor_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'academic_resources'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'tutor'
  )
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Tutors can read files in their own folder. Clients can read files in this bucket.
drop policy if exists "academic_resources_select_tutor_or_client" on storage.objects;
create policy "academic_resources_select_tutor_or_client"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'academic_resources'
  and (
    (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'tutor'
      )
      and split_part(name, '/', 1) = auth.uid()::text
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
    )
  )
);

-- Tutors can update their own files.
drop policy if exists "academic_resources_update_tutor_own" on storage.objects;
create policy "academic_resources_update_tutor_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'academic_resources'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'tutor'
  )
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'academic_resources'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Tutors can delete their own files.
drop policy if exists "academic_resources_delete_tutor_own" on storage.objects;
create policy "academic_resources_delete_tutor_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'academic_resources'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'tutor'
  )
  and split_part(name, '/', 1) = auth.uid()::text
);
