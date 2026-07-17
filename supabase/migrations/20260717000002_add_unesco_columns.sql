-- Add UNESCO area columns to faculty_profiles for the wizard onboarding
-- Date: 2026-07-17

ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS unesco_area text,
  ADD COLUMN IF NOT EXISTS unesco_subarea text,
  ADD COLUMN IF NOT EXISTS unesco_topics text;

SELECT pg_notify('pgrst', 'reload schema');