-- Faculty profile expanded: add missing columns used by profile form
-- Date: 2026-03-26

ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS aneca_accreditation text,
  ADD COLUMN IF NOT EXISTS research_publications text,
  ADD COLUMN IF NOT EXISTS google_scholar_id text,
  ADD COLUMN IF NOT EXISTS orcid_id text,
  ADD COLUMN IF NOT EXISTS is_phd boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS academic_level text,
  ADD COLUMN IF NOT EXISTS hide_from_current_institution boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_token text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_whatsapp text,
  ADD COLUMN IF NOT EXISTS contact_linkedin text,
  ADD COLUMN IF NOT EXISTS notify_new_offers boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_weekly_digest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text DEFAULT 'email';

-- Unique index on user_id for safe upsert (row guaranteed by signup trigger)
CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_profiles_user_id
  ON public.faculty_profiles(user_id);

-- Add subarea and topics to faculty_expertise (were missing)
ALTER TABLE public.faculty_expertise
  ADD COLUMN IF NOT EXISTS subarea text,
  ADD COLUMN IF NOT EXISTS topics text[] DEFAULT '{}';

SELECT pg_notify('pgrst', 'reload schema');
