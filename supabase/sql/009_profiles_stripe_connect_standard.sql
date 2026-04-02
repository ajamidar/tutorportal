-- TutorPortal MVP - Stripe Connect Standard profile fields
-- Run this after 008_invoices_billing_foundation.sql

alter table public.profiles
add column if not exists stripe_connect_id text;

alter table public.profiles
add column if not exists stripe_onboarding_complete boolean not null default false;

create unique index if not exists profiles_stripe_connect_id_unique_idx
on public.profiles (stripe_connect_id)
where stripe_connect_id is not null;
