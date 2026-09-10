-- ============================================================================
-- Migración: rastro de quién puso un perfil docente en privado / oculto
-- Fecha: 2026-09-10
--
-- Motivo: hasta ahora un perfil con visibility='private' podía haber llegado
-- ahí por tres caminos distintos y no había forma de saber cuál:
--   1. Por defecto del sistema antiguo (el trigger de alta lo creaba privado).
--   2. Decisión del propio docente en /app/faculty/privacy.
--   3. Un admin lo ocultó desde /control (acción hideFaculty).
-- Ninguno dejaba fecha ni marca. En el panel solo se veía "Oculto".
--
-- Se añaden dos columnas:
--   visibility_updated_at  — cuándo se cambió la visibilidad por última vez
--   visibility_source      — 'faculty' (el docente) | 'admin' | NULL (sin
--                            registro: viene del sistema antiguo o nunca se
--                            tocó desde que existe este rastro)
--
-- SIN backfill a propósito: todas las filas existentes quedan con
-- visibility_source = NULL, es decir "no consta que nadie lo decidiera".
-- Solo se rellena de aquí en adelante, cuando el docente o un admin cambien
-- el ajuste de verdad.
-- ============================================================================

BEGIN;

ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS visibility_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS visibility_source text;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Las columnas existen y todas las filas están sin registro todavía:
--    SELECT count(*) FILTER (WHERE visibility_source IS NULL) AS sin_registro,
--           count(*) FILTER (WHERE visibility_source = 'faculty') AS por_docente,
--           count(*) FILTER (WHERE visibility_source = 'admin') AS por_admin
--    FROM public.faculty_profiles;
--    (esperado justo tras la migración: sin_registro = total, los otros 0)
--
-- 2. A medida que se vaya usando, ver quién eligió privado y cuándo:
--    SELECT up.full_name, up.email, fp.visibility, fp.visibility_source,
--           fp.visibility_updated_at
--    FROM public.faculty_profiles fp
--    JOIN public.user_profiles up ON up.id = fp.id
--    WHERE fp.visibility = 'private'
--    ORDER BY fp.visibility_updated_at DESC NULLS LAST;
