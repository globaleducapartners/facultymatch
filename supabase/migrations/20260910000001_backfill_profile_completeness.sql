-- ============================================================================
-- Migración: rellenar faculty_profiles.profile_completeness
-- Fecha: 2026-09-10
--
-- Motivo: la columna profile_completeness existía pero NADA en la app la
-- escribía nunca — estaba a 0 para todos los perfiles. Varias pantallas y el
-- cron de recordatorios la leían igualmente ("< 80%" siempre cierto, métricas
-- de embudo siempre a 0, etc.). A partir de ahora se recalcula en cada guardado
-- de perfil desde el código (src/lib/faculty-completeness.ts,
-- refreshFacultyCompleteness), y todas las pantallas la calculan en vivo con
-- ese mismo módulo. Esta migración deja la columna con un valor real para las
-- filas ya existentes, antes de que se vuelva a guardar ninguna.
--
-- El cálculo aquí replica los pesos del módulo JS (suman 100):
--   titular 12 · biografía 16 · ubicación 10 · área de especialidad 16 ·
--   idiomas 10 · disponibilidad 10 · foto 12 · titulación 8 ·
--   historial docente 4 · nivel académico 2
-- La foto vive en user_profiles.avatar_url; el área en faculty_expertise
-- (o en faculty_profiles.faculty_areas si es de un perfil antiguo).
-- ============================================================================

BEGIN;

WITH scores AS (
  SELECT
    fp.id,
    (
      (CASE WHEN nullif(btrim(coalesce(fp.headline, '')), '') IS NOT NULL THEN 12 ELSE 0 END)
    + (CASE WHEN nullif(btrim(coalesce(fp.bio, '')), '') IS NOT NULL THEN 16 ELSE 0 END)
    + (CASE WHEN nullif(btrim(coalesce(fp.location, '')), '') IS NOT NULL
            OR (nullif(btrim(coalesce(fp.city, '')), '') IS NOT NULL
                AND nullif(btrim(coalesce(fp.country, '')), '') IS NOT NULL)
           THEN 10 ELSE 0 END)
    + (CASE WHEN EXISTS (SELECT 1 FROM public.faculty_expertise fe WHERE fe.faculty_id = fp.id)
            OR (fp.faculty_areas IS NOT NULL
                AND jsonb_typeof(to_jsonb(fp.faculty_areas)) = 'array'
                AND jsonb_array_length(to_jsonb(fp.faculty_areas)) > 0)
           THEN 16 ELSE 0 END)
    + (CASE WHEN fp.languages IS NOT NULL
            AND jsonb_typeof(to_jsonb(fp.languages)) = 'array'
            AND jsonb_array_length(to_jsonb(fp.languages)) > 0
           THEN 10 ELSE 0 END)
    + (CASE WHEN nullif(btrim(coalesce(fp.availability, '')), '') IS NOT NULL THEN 10 ELSE 0 END)
    + (CASE WHEN EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = fp.id
              AND nullif(btrim(coalesce(up.avatar_url, '')), '') IS NOT NULL
          ) THEN 12 ELSE 0 END)
    + (CASE WHEN fp.degrees IS NOT NULL
            AND jsonb_typeof(to_jsonb(fp.degrees)) = 'array'
            AND jsonb_array_length(to_jsonb(fp.degrees)) > 0
           THEN 8 ELSE 0 END)
    + (CASE WHEN fp.institutions_taught IS NOT NULL
            AND jsonb_typeof(to_jsonb(fp.institutions_taught)) = 'array'
            AND jsonb_array_length(to_jsonb(fp.institutions_taught)) > 0
           THEN 4 ELSE 0 END)
    + (CASE WHEN nullif(btrim(coalesce(fp.academic_level, '')), '') IS NOT NULL THEN 2 ELSE 0 END)
    ) AS score
  FROM public.faculty_profiles fp
)
UPDATE public.faculty_profiles fp
SET profile_completeness = s.score
FROM scores s
WHERE s.id = fp.id
  AND fp.profile_completeness IS DISTINCT FROM s.score;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Distribución de completitud tras el backfill:
--    SELECT width_bucket(profile_completeness, 0, 101, 10) AS bucket,
--           count(*)
--    FROM public.faculty_profiles
--    GROUP BY 1 ORDER BY 1;
--
-- 2. Comprobar un perfil concreto (p.ej. el de Miguel — debe salir al 100):
--    SELECT fp.profile_completeness, fp.headline, fp.bio IS NOT NULL AS has_bio,
--           fp.availability, fp.academic_level,
--           EXISTS (SELECT 1 FROM public.faculty_expertise fe WHERE fe.faculty_id = fp.id) AS has_expertise
--    FROM public.faculty_profiles fp
--    JOIN public.user_profiles up ON up.id = fp.id
--    WHERE up.full_name ILIKE '%Martí Escolano%';
--
-- 3. Ya no debería haber perfiles verificados por debajo de ~70%:
--    SELECT count(*) FROM public.faculty_profiles
--    WHERE estado_perfil = 'verificado' AND profile_completeness < 70;
