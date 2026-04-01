-- TutorPortal MVP - store selected subject on sessions
-- Run this after 006_sessions_recurring_foundation.sql

alter table public.sessions
add column if not exists subject text;
