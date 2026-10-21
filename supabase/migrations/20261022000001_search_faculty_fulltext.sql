-- ============================================================================
-- Migración: buscador de texto completo para docentes
-- Fecha: 2026-10-22
--
-- Motivo: el buscador usaba ILIKE sobre la frase entera y solo en titular,
-- bio, institución actual y títulos. Consecuencias: "marketing digital
-- valencia" no encontraba nada si esas palabras no aparecían juntas y en ese
-- orden en un mismo campo; "educacion" no encontraba "educación"; no miraba
-- áreas, temas, instituciones donde ha dado clase, publicaciones, ciudad ni
-- idiomas; y no había orden por relevancia.
--
-- Esta migración añade una búsqueda de texto completo en español:
--   · ignora tildes y mayúsculas, y entiende plurales y derivadas (stemming);
--   · todas las palabras deben aparecer, en cualquier campo y orden; las
--     palabras se buscan también por prefijo ("investig" → "investigación");
--   · si no hay resultados con todas las palabras, prueba con cualquiera de
--     ellas, y después con tolerancia a erratas (pg_trgm);
--   · devuelve una puntuación de relevancia: nombre, titular y áreas pesan
--     más que institución y títulos, y estos más que bio y publicaciones.
--
-- Esta migración NO modifica datos: solo crea una vista y una función de
-- lectura. No hace falta copia de seguridad. El código ya desplegado funciona
-- sin ella (usa la búsqueda anterior) y empieza a usarla solo al aplicarla.
-- Con miles de perfiles convendrá guardar el vector ya calculado; hoy, con
-- decenas, calcularlo al vuelo es instantáneo.
-- ============================================================================

BEGIN;

-- Para que unaccent/pg_trgm se resuelvan estén en `extensions` (Supabase) o en `public`.
SET LOCAL search_path = public, extensions;

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm  WITH SCHEMA extensions;

-- Documento de búsqueda de cada docente (una fila por perfil).
CREATE OR REPLACE VIEW public.faculty_search_docs AS
SELECT
  fp.id,
  (
    setweight(to_tsvector('spanish', unaccent(coalesce(up.full_name, '') || ' ' || coalesce(fp.headline, '') || ' ' || coalesce(fp.current_position, '') || ' ' || coalesce(ex.txt, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(
      coalesce(fp.current_institution, '') || ' ' || coalesce(fp.current_company, '') || ' ' || coalesce(fp.industry_sector, '') || ' ' ||
      coalesce(regexp_replace(fp.degrees::text, '"[A-Za-z_]+"\s*:', ' ', 'g'), '') || ' ' ||
      coalesce(fp.institutions_taught::text, '') || ' ' || coalesce(fp.faculty_areas::text, '') || ' ' ||
      coalesce(fp.subjects::text, '') || ' ' || coalesce(fp.academic_level, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(
      coalesce(fp.bio, '') || ' ' || coalesce(fp.career_description, '') || ' ' || coalesce(fp.research_publications, '') || ' ' ||
      coalesce(regexp_replace(fp.languages::text, '"[A-Za-z_]+"\s*:', ' ', 'g'), '') || ' ' ||
      coalesce(fp.city, '') || ' ' || coalesce(fp.country, '') || ' ' || coalesce(fp.location, '') || ' ' ||
      coalesce(fp.modalities::text, '') || ' ' || coalesce(fp.aneca_accreditation, ''))), 'C')
  ) AS doc,
  unaccent(lower(coalesce(up.full_name, '') || ' ' || coalesce(fp.headline, '') || ' ' || coalesce(fp.current_institution, '') || ' ' || coalesce(ex.txt, ''))) AS fuzzy_text
FROM public.faculty_profiles fp
LEFT JOIN public.user_profiles up ON up.id = fp.id
LEFT JOIN LATERAL (
  SELECT string_agg(coalesce(e.area, '') || ' ' || coalesce(e.subarea, '') || ' ' || coalesce(e.topics::text, ''), ' ') AS txt
  FROM public.faculty_expertise e
  WHERE e.faculty_id = fp.id
) ex ON true;

REVOKE ALL ON public.faculty_search_docs FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.faculty_search_docs TO service_role;

-- Búsqueda: devuelve los ids de docentes que encajan, de más a menos relevante.
CREATE OR REPLACE FUNCTION public.search_faculty(p_query text, p_limit integer DEFAULT 200)
RETURNS TABLE(faculty_id uuid, rank real)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_clean text := unaccent(lower(coalesce(p_query, '')));
  v_words text[];
  v_all   tsquery;
  v_any   tsquery;
BEGIN
  -- Palabras útiles: solo letras y números (nada que pueda inyectarse en la
  -- consulta), sin palabras vacías ("de", "en"...) y como máximo 8.
  SELECT array_agg(w) INTO v_words
  FROM (
    SELECT DISTINCT w
    FROM regexp_split_to_table(v_clean, '[^a-z0-9]+') AS w
    WHERE length(w) >= 2 AND to_tsvector('spanish', w) <> ''::tsvector
    LIMIT 8
  ) s;

  IF v_words IS NULL THEN
    RETURN;
  END IF;

  v_all := to_tsquery('spanish', array_to_string(ARRAY(SELECT w || ':*' FROM unnest(v_words) AS w), ' & '));
  v_any := to_tsquery('spanish', array_to_string(ARRAY(SELECT w || ':*' FROM unnest(v_words) AS w), ' | '));

  -- 1) Todas las palabras.
  RETURN QUERY
    SELECT d.id, ts_rank_cd(d.doc, v_all)::real
    FROM public.faculty_search_docs d
    WHERE d.doc @@ v_all
    ORDER BY 2 DESC
    LIMIT p_limit;
  IF FOUND THEN RETURN; END IF;

  -- 2) Cualquiera de las palabras (solo si hay más de una).
  IF array_length(v_words, 1) > 1 THEN
    RETURN QUERY
      SELECT d.id, ts_rank_cd(d.doc, v_any)::real
      FROM public.faculty_search_docs d
      WHERE d.doc @@ v_any
      ORDER BY 2 DESC
      LIMIT p_limit;
    IF FOUND THEN RETURN; END IF;
  END IF;

  -- 3) Erratas: parecido por trigramas con nombre, titular, institución y áreas.
  RETURN QUERY
    SELECT d.id, word_similarity(v_clean, d.fuzzy_text)::real
    FROM public.faculty_search_docs d
    WHERE word_similarity(v_clean, d.fuzzy_text) >= 0.55
    ORDER BY 2 DESC
    LIMIT p_limit;
END;
$$;

-- Mismo patrón que el resto de RPC: solo el service role (la app) la ejecuta.
REVOKE EXECUTE ON FUNCTION public.search_faculty(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_faculty(text, integer) TO service_role;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Existen la vista y la función:
--    SELECT (SELECT count(*) FROM public.faculty_search_docs) AS perfiles_indexados,
--           (SELECT count(*) FROM pg_proc WHERE proname = 'search_faculty') AS funcion;
--    Debe dar: perfiles_indexados = nº de filas de faculty_profiles, funcion = 1
--
-- 2. anon y authenticated NO pueden ejecutarla; service_role sí:
--    SELECT has_function_privilege('anon', 'public.search_faculty(text, integer)', 'EXECUTE') AS anon_puede,
--           has_function_privilege('authenticated', 'public.search_faculty(text, integer)', 'EXECUTE') AS authenticated_puede,
--           has_function_privilege('service_role', 'public.search_faculty(text, integer)', 'EXECUTE') AS service_role_puede;
--    Debe dar: false, false, true
--
-- 3. Pruebas: sin tildes, varias palabras en cualquier orden y erratas:
--    SELECT * FROM search_faculty('educacion');
--    SELECT * FROM search_faculty('marketing murcia');
--    SELECT * FROM search_faculty('estrategia empresarial');
--    SELECT * FROM search_faculty('marketng');  -- errata
