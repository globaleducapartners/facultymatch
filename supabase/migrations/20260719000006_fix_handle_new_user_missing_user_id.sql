-- =============================================================================
-- FacultyMatch: Corrige regresión de handle_new_user() — user_id sin rellenar
-- Date: 2026-07-19
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  APLICAR EN EL SQL EDITOR                                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Regresión de HOY: 20260719000001_backfill_email_user_profiles.sql
-- reemplazó handle_new_user() para añadir email, pero al reescribir la
-- función se perdió "user_id" en el INSERT de faculty_profiles (y también
-- en institutions) que sí estaba en la versión de 20260325000001. Desde que
-- se aplicó esa migración, toda alta nueva crea faculty_profiles/
-- institutions con user_id = NULL.
--
-- Efecto observado hoy: cualquier upsert con
-- `.upsert({...}, { onConflict: "user_id" })` no encuentra la fila ya
-- creada por el trigger (NULL no matchea nunca en un ON CONFLICT), intenta
-- INSERTar una fila nueva, y esa choca con la primary key `id` →
-- "duplicate key value violates unique constraint faculty_profiles_pkey".
-- Rompió el guardado del primer paso del wizard con una cuenta creada hoy
-- mismo, después de aplicar 20260719000001.
--
-- Esta migración:
--   1. Restaura user_id en los INSERT de faculty_profiles e institutions
--      dentro de handle_new_user(), sin tocar ningún otro campo de la
--      versión vigente (mismo cuerpo que 20260719000001 + esas dos
--      columnas).
--   2. Backfillea user_id = id en las filas ya creadas con el bug.
--
-- Nota aparte (no corregida aquí, ver conversación): las server actions
-- legacy saveOnboarding/autosaveOnboarding (ruta /onboarding, ya marcada
-- como "old/legacy" en robots.ts) tienen el mismo patrón de upsert con
-- onConflict "user_id" y además no envían "id" en el payload de inserción.
-- Si esa ruta sigue siendo alcanzable, tiene el mismo bug y algo peor (el
-- INSERT fallaría por id NULL, no solo por conflicto). Se deja fuera de
-- esta migración porque es código de un flujo ya sustituido por el wizard
-- de 5 pasos — decidir aparte si se repara o se elimina la ruta.
-- =============================================================================

BEGIN;

-- 1. Backup de las filas afectadas antes de mutar
CREATE TABLE IF NOT EXISTS public.faculty_profiles_backup_20260719_userid AS
SELECT * FROM public.faculty_profiles WHERE user_id IS NULL;

CREATE TABLE IF NOT EXISTS public.institutions_backup_20260719_userid AS
SELECT * FROM public.institutions WHERE user_id IS NULL;

ALTER TABLE public.faculty_profiles_backup_20260719_userid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions_backup_20260719_userid ENABLE ROW LEVEL SECURITY;

-- 2. Restaurar handle_new_user() — idéntica a 20260719000001, solo se añade
--    user_id en los dos INSERT que lo habían perdido
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
    email,
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
    NEW.email,
    CASE WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean THEN now() ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data->>'privacy_accepted')::boolean THEN now() ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'consent_version', 'v1')
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        terms_accepted_at = COALESCE(EXCLUDED.terms_accepted_at, user_profiles.terms_accepted_at),
        privacy_accepted_at = COALESCE(EXCLUDED.privacy_accepted_at, user_profiles.privacy_accepted_at),
        marketing_opt_in = EXCLUDED.marketing_opt_in,
        consent_version = EXCLUDED.consent_version;

  IF v_role = 'faculty' THEN
    INSERT INTO public.faculty_profiles (id, user_id, visibility, is_active, is_verified)
    VALUES (NEW.id, NEW.id, 'private', true, false)
    ON CONFLICT (id) DO NOTHING;
  ELSIF v_role = 'institution' THEN
    INSERT INTO public.institutions (id, user_id, name)
    VALUES (NEW.id, NEW.id, v_institution_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3. Backfill de las filas ya creadas con el bug (user_id NULL desde que se
--    aplicó 20260719000001)
UPDATE public.faculty_profiles SET user_id = id WHERE user_id IS NULL;
UPDATE public.institutions SET user_id = id WHERE user_id IS NULL;

-- Reload schema cache
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- =============================================================================
-- VERIFICACIONES (segunda pasada)
-- =============================================================================

-- 1. No debe quedar ninguna fila con user_id NULL
-- SELECT count(*) FROM public.faculty_profiles WHERE user_id IS NULL;
-- SELECT count(*) FROM public.institutions WHERE user_id IS NULL;
-- Ambas deben dar 0

-- 2. Cuántas filas se vieron afectadas por el bug (solo informativo)
-- SELECT count(*) FROM public.faculty_profiles_backup_20260719_userid;
-- SELECT count(*) FROM public.institutions_backup_20260719_userid;

-- 3. La función ya debe incluir user_id en ambos INSERT
-- SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
-- Busca visualmente "INSERT INTO public.faculty_profiles (id, user_id, ...)"
-- e "INSERT INTO public.institutions (id, user_id, ...)"
