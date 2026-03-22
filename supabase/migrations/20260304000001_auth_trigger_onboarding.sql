BEGIN;

-- 1) Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
  v_full_name text;
  v_institution_name text;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'faculty');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_institution_name := COALESCE(NEW.raw_user_meta_data->>'institution_name', v_full_name);

  INSERT INTO public.user_profiles (id, role, full_name, avatar_url)
  VALUES (NEW.id, v_role, v_full_name, NULL)
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;

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
$$;

-- 2) Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) RLS policies minimal, no recursion
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles;
CREATE POLICY user_profiles_select_own
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR role = 'faculty');

DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Importante: NO policy INSERT necesaria para user_profiles.
-- Si existe user_profiles_insert_own, eliminarla para evitar conflictos.
DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;

COMMIT;
