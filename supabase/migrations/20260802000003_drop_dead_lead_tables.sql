-- ============================================================================
-- Migración: eliminar tablas de leads sin usar (faculty_leads, institution_applications)
-- Fecha: 2026-08-02
--
-- Motivo: restos de un formulario de captación (/apply, /apply/institution)
-- retirado desde hace semanas — las páginas /apply y /apply/institution ya
-- solo redirigen al registro normal, y las rutas API que escribían en estas
-- tablas (src/app/api/apply/route.ts, src/app/api/apply/institution/route.ts,
-- src/app/api/lead-received/route.ts) se han eliminado en el mismo commit
-- que esta migración por no tener ningún llamante en todo el repo.
--
-- Ambas tablas están vacías (comprobado antes de escribir esta migración:
-- 0 filas en las dos). No se toca newsletter_subscribers — esa sí sigue
-- activa, alimentada desde el formulario "Suscribirme" de /resources.
--
-- Backup por si acaso, aunque estén vacías — hábito de esta base de código
-- antes de cualquier DROP con datos reales.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public._backup_20260802_faculty_leads AS
  SELECT * FROM public.faculty_leads;
CREATE TABLE IF NOT EXISTS public._backup_20260802_institution_applications AS
  SELECT * FROM public.institution_applications;

DROP TABLE IF EXISTS public.faculty_leads;
DROP TABLE IF EXISTS public.institution_applications;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Las tablas ya no existen:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public' AND table_name IN ('faculty_leads', 'institution_applications');
--    Debe devolver 0 filas.
--
-- 2. Los backups existen (por si hiciera falta consultar algo después):
--    SELECT count(*) FROM public._backup_20260802_faculty_leads;
--    SELECT count(*) FROM public._backup_20260802_institution_applications;
--
-- 3. Una vez tranquilo de que no hace falta nada de ahí, puedes borrar los
--    backups cuando quieras:
--    DROP TABLE public._backup_20260802_faculty_leads;
--    DROP TABLE public._backup_20260802_institution_applications;
