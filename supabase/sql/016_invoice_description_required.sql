-- Require invoice description and use it as invoice title in UI.
-- Run this after 015_auto_logout_last_activity.sql

alter table public.invoices
add column if not exists description text;

-- Backfill existing rows so the field can be set to NOT NULL safely.
update public.invoices
set description = coalesce(nullif(trim(description), ''), 'Tutoring Invoice')
where description is null or trim(description) = '';

alter table public.invoices
alter column description set not null;

comment on column public.invoices.description is 'Tutor-entered invoice title/description shown in tutor and client portals.';
