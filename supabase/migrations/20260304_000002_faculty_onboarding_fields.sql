-- Migration for faculty onboarding enrichment fields
-- Ensure all necessary columns exist for the new 2-step onboarding wizard

-- Visibility enum (ensure it's compatible)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_mode') THEN
        CREATE TYPE public.visibility_mode AS ENUM ('public', 'hidden', 'institutions_only');
    END IF;
END $$;

-- Update faculty_profiles table
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS visibility public.visibility_mode DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS degrees jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS institutions_taught jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faculty_areas jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS modalities jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Notify PostgREST to reload schema cache
SELECT pg_notify('pgrst', 'reload schema');
