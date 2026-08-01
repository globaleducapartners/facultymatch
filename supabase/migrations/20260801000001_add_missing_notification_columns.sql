-- ============================================================================
-- Migración: columnas de preferencias de notificación en faculty_profiles
-- Fecha: 2026-08-01
-- Motivo: la migración 20260326000001_faculty_profile_expanded.sql define
--   notify_new_offers, notify_messages, notify_weekly_digest y
--   preferred_contact_method, pero el editor de perfil (pestaña
--   "Preferencias") y los ajustes de notificación del dashboard docente
--   fallan al guardar con "Could not find the column ... in the schema
--   cache" (PGRST204) — confirmado el 2026-08-01 con:
--     SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'faculty_profiles' AND column_name LIKE 'notify_%';
--   → 0 filas. Estas columnas nunca llegaron a crearse en esta base de datos.
--
-- Sin riesgo para datos existentes: solo añade columnas nuevas con DEFAULT,
-- no borra ni modifica ninguna fila. Por eso no se incluye backup de tabla.
-- ============================================================================

BEGIN;

ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS notify_new_offers boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_weekly_digest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text DEFAULT 'email';

-- Backfill explícito para filas existentes que puedan tener NULL en vez del
-- default (por si la columna ya existiera parcialmente con NULLs sueltos).
UPDATE public.faculty_profiles
SET
  notify_new_offers = COALESCE(notify_new_offers, true),
  notify_messages = COALESCE(notify_messages, true),
  notify_weekly_digest = COALESCE(notify_weekly_digest, false),
  preferred_contact_method = COALESCE(preferred_contact_method, 'email');

-- Refresca el caché de esquema de PostgREST — sin esto la API seguiría
-- devolviendo "column not found" aunque la columna ya exista.
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada, después del
-- COMMIT — el SQL Editor solo muestra el resultado de la última sentencia)
-- ============================================================================
-- 1. Deben aparecer las 4 columnas:
--    SELECT column_name, data_type, column_default FROM information_schema.columns
--    WHERE table_name = 'faculty_profiles' AND column_name IN
--      ('notify_new_offers','notify_messages','notify_weekly_digest','preferred_contact_method');
--
-- 2. No debe haber ninguna fila con NULL en estos campos:
--    SELECT count(*) FROM public.faculty_profiles
--    WHERE notify_new_offers IS NULL OR notify_messages IS NULL
--       OR notify_weekly_digest IS NULL OR preferred_contact_method IS NULL;
--    -- Debe dar 0
