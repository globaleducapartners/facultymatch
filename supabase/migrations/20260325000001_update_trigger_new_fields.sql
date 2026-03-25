CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $body$
DECLARE
  v_role public.user_role;
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_institution_name text;
BEGIN
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'faculty';
  END;
  IF v_role IS NULL THEN v_role := 'faculty'; END IF;

  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NULLIF(TRIM(v_first_name || ' ' || v_last_name), ''),
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  v_institution_name := COALESCE(
    NEW.raw_user_meta_data->>'institution_name',
    v_full_name
  );

  INSERT INTO public.user_profiles (
    id, role, full_name, onboarding_completed,
    terms_accepted_at, privacy_accepted_at,
    marketing_opt_in, consent_version
  )
  VALUES (
    NEW.id, v_role, v_full_name, true,
    CASE WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean
         THEN now() ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data->>'privacy_accepted')::boolean
         THEN now() ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'consent_version', 'v1')
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        onboarding_completed = true,
        terms_accepted_at = COALESCE(EXCLUDED.terms_accepted_at,
                                     user_profiles.terms_accepted_at),
        privacy_accepted_at = COALESCE(EXCLUDED.privacy_accepted_at,
                                       user_profiles.privacy_accepted_at),
        marketing_opt_in = EXCLUDED.marketing_opt_in,
        consent_version = EXCLUDED.consent_version;

  IF v_role = 'faculty' THEN
    INSERT INTO public.faculty_profiles (
      id, user_id, visibility, is_active, is_verified,
      faculty_areas, availability, modalities, linkedin_url
    )
    VALUES (
      NEW.id, NEW.id, 'public', true, false,
      COALESCE(
        (SELECT array_agg(elem)
         FROM jsonb_array_elements_text(
           NEW.raw_user_meta_data->'knowledge_areas'
         ) AS elem),
        '{}'
      ),
      NEW.raw_user_meta_data->>'availability',
      COALESCE(
        (SELECT array_agg(elem)
         FROM jsonb_array_elements_text(
           NEW.raw_user_meta_data->'modalities'
         ) AS elem),
        '{}'
      ),
      NEW.raw_user_meta_data->>'linkedin_url'
    )
    ON CONFLICT (id) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          faculty_areas = EXCLUDED.faculty_areas,
          availability = EXCLUDED.availability,
          modalities = EXCLUDED.modalities,
          linkedin_url = EXCLUDED.linkedin_url;

  ELSIF v_role = 'institution' THEN
    INSERT INTO public.institutions (id, user_id, name, type, country)
    VALUES (
      NEW.id, NEW.id,
      v_institution_name,
      NEW.raw_user_meta_data->>'institution_type',
      NEW.raw_user_meta_data->>'country'
    )
    ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          user_id = EXCLUDED.user_id,
          type = EXCLUDED.type,
          country = EXCLUDED.country;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[handle_new_user] error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$body$;

SELECT pg_notify('pgrst', 'reload schema');
