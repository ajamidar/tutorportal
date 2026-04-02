-- TutorPortal MVP - billing and invoice foundation
-- Run this after 007_sessions_subject_support.sql

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'invoice_status' and n.nspname = 'public'
  ) then
    create type public.invoice_status as enum ('unpaid', 'paid', 'void');
  end if;
end
$$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  amount_pence integer not null check (amount_pence > 0),
  status public.invoice_status not null default 'unpaid',
  stripe_payment_link text not null,
  stripe_payment_link_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_tutor_id_created_at_idx
on public.invoices (tutor_id, created_at desc);

create index if not exists invoices_client_id_created_at_idx
on public.invoices (client_id, created_at desc);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row
execute procedure public.set_updated_at();

alter table public.invoices enable row level security;

-- Tutors can fully manage their own invoices.
drop policy if exists "invoices_select_tutor_own" on public.invoices;
create policy "invoices_select_tutor_own"
on public.invoices
for select
to authenticated
using (auth.uid() = tutor_id);

drop policy if exists "invoices_insert_tutor_own" on public.invoices;
create policy "invoices_insert_tutor_own"
on public.invoices
for insert
to authenticated
with check (auth.uid() = tutor_id);

drop policy if exists "invoices_update_tutor_own" on public.invoices;
create policy "invoices_update_tutor_own"
on public.invoices
for update
to authenticated
using (auth.uid() = tutor_id)
with check (auth.uid() = tutor_id);

drop policy if exists "invoices_delete_tutor_own" on public.invoices;
create policy "invoices_delete_tutor_own"
on public.invoices
for delete
to authenticated
using (auth.uid() = tutor_id);

-- Clients can only view invoices linked to their own roster rows.
drop policy if exists "invoices_select_client_own" on public.invoices;
create policy "invoices_select_client_own"
on public.invoices
for select
to authenticated
using (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = invoices.client_id
      and cp.client_id = auth.uid()
  )
);
