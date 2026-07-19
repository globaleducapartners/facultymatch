-- =============================================================================
-- FacultyMatch: Backfill user_profiles.email desde auth.users
-- Date: 2026-07-19
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  APLICAR EN EL SQL EDITOR                                              ║
-- ║  Tras aplicarla, ejecutar verificaciones en la segunda pasada.         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Problema: 24 de 30 faculty tienen user_profiles.email = NULL.
--   El trigger handle_new_user() nunca inserta email en user_profiles.
--   El email real está en auth.users, duplicado en ninguna parte.
--   Cualquier código que lea user_profiles.email falla silenciosamente.
--
-- Solución:
--   1. Backfill masivo: user_profiles.email ← auth.users.email
--   2. Actualizar handle_new_user() para que inserte email en adelante
--   3. Nuevo trigger on_auth_user_email_update: sincroniza cambios de email en auth.users
--   4. Marcar columna como sincronizada (no deprecated)
-- =============================================================================

BEGIN;

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. Backfill — todos los user_profiles con email NULL
-- ═════════════════════════════════════════════════════════════════════════════

UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE au.id = up.id
  AND up.email IS NULL
  AND au.email IS NOT NULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. Actualizar handle_new_user() para que escriba email en user_profiles
-- ═════════════════════════════════════════════════════════════════════════════

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
    email,                              -- ← NUEVO: sincronizado con auth.users
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
    NEW.email,                          -- ← NUEVO
    CASE WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean THEN now() ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data->>'privacy_accepted')::boolean THEN now() ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'consent_version', 'v1')
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,          -- ← NUEVO
        terms_accepted_at = COALESCE(EXCLUDED.terms_accepted_at, user_profiles.terms_accepted_at),
        privacy_accepted_at = COALESCE(EXCLUDED.privacy_accepted_at, user_profiles.privacy_accepted_at),
        marketing_opt_in = EXCLUDED.marketing_opt_in,
        consent_version = EXCLUDED.consent_version;

  IF v_role = 'faculty' THEN
    INSERT INTO public.faculty_profiles (id, visibility, is_active, is_verified)
    VALUES (NEW.id, 'private', true, false)
    ON CONFLICT (id) DO NOTHING;
  ELSIF v_role = 'institution' THEN
    INSERT INTO public.institutions (id, name)
    VALUES (NEW.id, v_institution_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. Trigger ON UPDATE OF email ON auth.users para mantener user_profiles.email sincronizado
-- ═════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_user_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_profiles
  SET email = NEW.email
  WHERE id = NEW.id
    AND email IS DISTINCT FROM NEW.email;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email();

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. Marcar columna con comentario
-- ═════════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.user_profiles.email IS
  'Sincronizado con auth.users.email: backfill inicial + handle_new_user() al INSERT + trigger on_auth_user_email_update al UPDATE. Usar esta columna como fuente local para evitar consultas a auth.users en lecturas frecuentes.';

-- Reload schema cache
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ═════════════════════════════════════════════════════════════════════════════
-- VERIFICACIONES (ejecutar como segunda pasada)
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. ¿Siguen existiendo user_profiles sin email?
--    Debe devolver 0
-- SELECT count(*) FROM public.user_profiles up
-- WHERE up.role = 'faculty' AND up.email IS NULL;

-- 2. ¿Son correctos los emails backfilleados? (spot check)
--    Debe mostrar 0 filas con discrepancia
-- SELECT up.id, up.full_name, up.email AS up_email, au.email AS au_email
-- FROM public.user_profiles up
-- JOIN auth.users au ON au.id = up.id
-- WHERE up.role = 'faculty' AND up.email != au.email;

-- 3. Resumen: distribución de emails por rol
-- SELECT up.role, count(*) AS total,
--   count(*) FILTER (WHERE up.email IS NOT NULL) AS con_email,
--   count(*) FILTER (WHERE up.email IS NULL) AS sin_email
-- FROM public.user_profiles up
-- GROUP BY up.role
-- ORDER BY up.role;