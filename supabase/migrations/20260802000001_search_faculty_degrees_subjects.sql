-- ============================================================================
-- Migración: búsqueda de texto sobre degrees/subjects para el buscador
-- Fecha: 2026-08-02
--
-- Motivo: el buscador de instituciones (y el directorio de docentes) construye
-- un filtro .or() combinando headline/bio/current_institution/degrees/subjects
-- con el operador ilike. degrees es jsonb y subjects es text[] — Postgres NO
-- tiene el operador ilike (~~*) para esos tipos, así que cada búsqueda con
-- texto libre (o con filtro de área, que también añadía degrees/subjects al
-- .or()) devolvía un error 404 de PostgREST ("operator does not exist: jsonb
-- ~~* unknown"). El código nunca comprobaba el error de esa consulta, así que
-- el fallo era invisible: la búsqueda simplemente devolvía cero resultados
-- para CUALQUIER texto (probado con "IA", "marketing", etc. — el problema que
-- reportó Miguel).
--
-- La corrección urgente ya se hizo en el código (quitar degrees/subjects del
-- .or() roto, que ahora sí devuelve resultados reales sobre headline/bio/
-- current_institution). Esta migración recupera la señal de degrees — datos
-- reales y útiles (títulos, universidad, campo de estudio) que hoy no
-- contribuyen a ningún resultado de búsqueda — mediante una función SQL que
-- sí puede castear jsonb a texto (cosa que el filtro de PostgREST por URL no
-- permite, comprobado). subjects se incluye también por si en el futuro se
-- empieza a rellenar (hoy está vacío en todos los perfiles).
--
-- El código que consume esta función (src/app/app/institution/search/page.tsx
-- y src/app/app/faculty/directory/page.tsx) ya está desplegado y falla de
-- forma segura si esta función todavía no existe (list de errores, sigue
-- funcionando con headline/bio/current_institution) — no hace falta ninguna
-- coordinación de despliegue, en cuanto se aplique esta migración la búsqueda
-- empieza a usarla sola.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.search_faculty_by_degrees_subjects(p_query text)
RETURNS TABLE(faculty_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id AS faculty_id
  FROM public.faculty_profiles
  WHERE degrees::text ILIKE '%' || p_query || '%'
     OR subjects::text ILIKE '%' || p_query || '%';
$$;

-- Mismo patrón que el resto de RPC de este proyecto: solo el service role
-- (el único que usa la app para las páginas de búsqueda) puede ejecutarla.
REVOKE EXECUTE ON FUNCTION public.search_faculty_by_degrees_subjects(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_faculty_by_degrees_subjects(text)
  TO service_role;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. La función existe:
--    SELECT pg_get_function_identity_arguments(oid) FROM pg_proc WHERE proname = 'search_faculty_by_degrees_subjects';
--
-- 2. anon y authenticated NO deben poder ejecutarla; service_role sí:
--    SELECT has_function_privilege('anon', 'public.search_faculty_by_degrees_subjects(text)', 'EXECUTE') AS anon_puede,
--           has_function_privilege('authenticated', 'public.search_faculty_by_degrees_subjects(text)', 'EXECUTE') AS authenticated_puede,
--           has_function_privilege('service_role', 'public.search_faculty_by_degrees_subjects(text)', 'EXECUTE') AS service_role_puede;
--    Debe dar: false, false, true
--
-- 3. Prueba manual — debe devolver filas para docentes con "Marketing" en
--    algún título de degrees:
--    SELECT * FROM search_faculty_by_degrees_subjects('marketing');
