-- GDPR Consent columns for user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS marketing_opt_in boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_version text DEFAULT 'v1';

-- Enriched faculty fields for faculty_profiles
-- Changing existing columns to JSONB for flexibility as requested
DO $$ 
BEGIN
    -- Only alter if they are not jsonb yet or just recreate them as requested
    -- languages is currently ARRAY, modalities is currently ARRAY
    ALTER TABLE public.faculty_profiles DROP COLUMN IF EXISTS languages;
    ALTER TABLE public.faculty_profiles ADD COLUMN languages jsonb DEFAULT '[]'::jsonb;
    
    ALTER TABLE public.faculty_profiles DROP COLUMN IF EXISTS modalities;
    ALTER TABLE public.faculty_profiles ADD COLUMN modalities jsonb DEFAULT '[]'::jsonb;

    -- Add new ones
    ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS degrees jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS institutions_taught jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS faculty_areas jsonb DEFAULT '[]'::jsonb;
    
    -- Ensure availability is text as requested
    ALTER TABLE public.faculty_profiles DROP COLUMN IF EXISTS availability;
    ALTER TABLE public.faculty_profiles ADD COLUMN availability text;

    -- Ensure others exist
    ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
    ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS location text;
END $$;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Update handle_new_user trigger to handle GDPR consents
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role public.user_role;
  v_full_name text;
  v_institution_name text;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'faculty');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_institution_name := COALESCE(NEW.raw_user_meta_data->>'institution_name', v_full_name);

  INSERT INTO public.user_profiles (
    id, 
    role, 
    full_name, 
    avatar_url,
    terms_accepted_at,
    privacy_accepted_at,
    marketing_opt_in,
    consent_version
  )
  VALUES (
    NEW.id, 
    v_role, 
    v_full_name, 
    NULL,
    CASE WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean THEN now() ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data->>'privacy_accepted')::boolean THEN now() ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'consent_version', 'v1')
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        terms_accepted_at = COALESCE(EXCLUDED.terms_accepted_at, user_profiles.terms_accepted_at),
        privacy_accepted_at = COALESCE(EXCLUDED.privacy_accepted_at, user_profiles.privacy_accepted_at),
        marketing_opt_in = EXCLUDED.marketing_opt_in,
        consent_version = EXCLUDED.consent_version;

  IF v_role = 'faculty' THEN
    INSERT INTO public.faculty_profiles (id, visibility, is_active, is_verified)
    VALUES (NEW.id, 'public', true, false)
    ON CONFLICT (id) DO NOTHING;
  ELSIF v_role = 'institution' THEN
    INSERT INTO public.institutions (id, name)
    VALUES (NEW.id, v_institution_name)
    ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name;
  END IF;

  RETURN NEW;
END;
$function$;
