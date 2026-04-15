-- Ensure invoice creation timestamp is always present for receipt generation.
-- Run this after 016_invoice_description_required.sql

alter table public.invoices
add column if not exists created_at timestamptz;

update public.invoices
set created_at = coalesce(created_at, updated_at, now())
where created_at is null;

alter table public.invoices
alter column created_at set default now();

alter table public.invoices
alter column created_at set not null;

comment on column public.invoices.created_at is 'Invoice issue timestamp used for billing history and payment receipts.';
