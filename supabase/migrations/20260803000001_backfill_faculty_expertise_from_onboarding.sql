-- ============================================================================
-- Migración: backfill de faculty_expertise desde los datos del onboarding
-- Fecha: 2026-08-03
--
-- Motivo: el asistente de onboarding (paso 3, especialidad) guardaba el área/
-- subárea/temas en columnas de faculty_profiles (unesco_area, unesco_subarea,
-- unesco_topics) — pero el resto de la aplicación (búsqueda, directorio,
-- perfil público, exportación a PDF, cálculo de completitud, panel de admin)
-- lee las especialidades de la tabla faculty_expertise, no de esas columnas.
-- Cualquier docente que completó el onboarding antes de este arreglo tiene su
-- especialidad "invisible" en el resto de la app. El código ya está corregido
-- para sincronizar ambos sitios en publishProfile() de aquí en adelante; esta
-- migración rellena lo que ya se guardó antes de ese arreglo.
--
-- Solo inserta cuando NO existe ya una fila de faculty_expertise con esa
-- misma área para ese docente (evita duplicados si se ejecuta más de una
-- vez, o si el docente ya la había añadido también a mano desde
-- /app/faculty/specialties).
-- ============================================================================

BEGIN;

INSERT INTO public.faculty_expertise (faculty_id, area, subarea, topics)
SELECT
  fp.id,
  fp.unesco_area,
  NULLIF(fp.unesco_subarea, ''),
  CASE
    WHEN fp.unesco_topics IS NOT NULL AND trim(fp.unesco_topics) <> ''
    THEN (
      SELECT array_agg(trim(t))
      FROM unnest(string_to_array(fp.unesco_topics, ',')) AS t
      WHERE trim(t) <> ''
    )
    ELSE '{}'::text[]
  END
FROM public.faculty_profiles fp
WHERE fp.unesco_area IS NOT NULL
  AND trim(fp.unesco_area) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.faculty_expertise fe
    WHERE fe.faculty_id = fp.id AND fe.area = fp.unesco_area
  );

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Cuántas filas se han añadido (compara con el total de perfiles con
--    unesco_area relleno, para saber cuántas faltaban):
--    SELECT count(*) FROM public.faculty_profiles WHERE unesco_area IS NOT NULL AND trim(unesco_area) <> '';
--    SELECT count(*) FROM public.faculty_expertise;
--
-- 2. Revisar algunas filas nuevas a mano:
--    SELECT fp.id, fp.unesco_area, fp.unesco_subarea, fp.unesco_topics,
--           fe.area, fe.subarea, fe.topics
--    FROM public.faculty_profiles fp
--    JOIN public.faculty_expertise fe ON fe.faculty_id = fp.id AND fe.area = fp.unesco_area
--    WHERE fp.unesco_area IS NOT NULL
--    LIMIT 20;
