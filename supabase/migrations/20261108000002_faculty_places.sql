-- ============================================================================
-- Migración: varias ciudades por docente (búsqueda geográfica, Fase 1b)
-- Fecha: 2026-11-08
--
-- Motivo: hay docentes que imparten en dos ciudades ("Valencia y Murcia") y
-- deben aparecer en la búsqueda por cercanía de AMBAS. La Fase 1 solo guardaba
-- una coordenada por perfil.
--
-- Esta migración añade:
--   · faculty_places: hasta 3 ciudades por docente (posición 0 = principal), con
--     sus coordenadas del centro de la ciudad. Solo el servidor puede leerla.
--   · geo_set_faculty_places(docente, ciudad, país): separa el texto de ciudad
--     ("Valencia y Murcia", "Alicante, Elche", "Valencia / Murcia"), ubica cada
--     parte y reemplaza las ciudades del docente de forma atómica. Primero
--     prueba el texto entero ("Villanueva y Geltrú" es una sola ciudad); solo si
--     no coincide lo separa, y entonces TODAS las partes deben reconocerse: si
--     alguna no, no se ubica ninguna (nunca se coloca un perfil en un sitio
--     dudoso: "Villanueva" sola sería otra ciudad). La ciudad principal se
--     copia también a faculty_profiles.latitude/longitude/geo_place_id.
--   · faculty_ids_near(): ahora mira todas las ciudades del docente y devuelve
--     la más cercana (con su nombre).
--
-- Backfill: se copian a faculty_places las ubicaciones principales ya
-- calculadas en la Fase 1 (los 30 docentes con coordenadas). El resto (p. ej.
-- "Valencia y Murcia") lo recalcula scripts/geocode-profiles.ts con la función.
--
-- No modifica ni borra ningún dato existente: crea una tabla nueva y la rellena
-- a partir de columnas que ya existían. No hace falta copia de seguridad.
--
-- Requiere la migración 20261108000001_geolocation_foundation.sql.
-- Aplicada en producción: PENDIENTE (anotar aquí la fecha cuando se aplique).
-- ============================================================================

BEGIN;

SET LOCAL search_path = public, extensions;

-- ── 1. Tabla ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faculty_places (
  faculty_id   uuid NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
  position     smallint NOT NULL CHECK (position BETWEEN 0 AND 2),   -- 0 = principal
  geo_place_id bigint REFERENCES public.geo_places(id) ON DELETE SET NULL,
  name         text NOT NULL,
  latitude     double precision NOT NULL,
  longitude    double precision NOT NULL,
  PRIMARY KEY (faculty_id, position)
);

CREATE INDEX IF NOT EXISTS faculty_places_lat_lng_idx ON public.faculty_places (latitude, longitude);

-- Sin políticas: solo el servidor (service_role) puede leerla o escribirla.
ALTER TABLE public.faculty_places ENABLE ROW LEVEL SECURITY;

-- ── 2. Backfill: las ubicaciones principales que ya existen ─────────────────
INSERT INTO public.faculty_places (faculty_id, position, geo_place_id, name, latitude, longitude)
SELECT fp.id, 0, fp.geo_place_id, g.name, fp.latitude, fp.longitude
FROM public.faculty_profiles fp
JOIN public.geo_places g ON g.id = fp.geo_place_id
WHERE fp.latitude IS NOT NULL AND fp.longitude IS NOT NULL
ON CONFLICT (faculty_id, position) DO NOTHING;

-- ── 3. Ubicar y guardar las ciudades de un docente ──────────────────────────
-- Devuelve cuántas ciudades se han guardado (0 si ninguna se reconoce).
CREATE OR REPLACE FUNCTION public.geo_set_faculty_places(p_faculty_id uuid, p_city text, p_country_code text)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
DECLARE
  r       record;
  part    text;
  n       integer := 0;
  seen    bigint[] := '{}';
  bad     boolean := false;
  primary_place record;
BEGIN
  DELETE FROM public.faculty_places WHERE faculty_id = p_faculty_id;

  IF coalesce(btrim(p_city), '') <> '' AND coalesce(btrim(p_country_code), '') <> '' THEN
    -- 1) El texto entero (una sola ciudad, aunque lleve " y " en el nombre).
    SELECT * INTO r FROM public.geo_resolve(p_city, p_country_code);
    IF FOUND THEN
      INSERT INTO public.faculty_places (faculty_id, position, geo_place_id, name, latitude, longitude)
      VALUES (p_faculty_id, 0, r.place_id, r.place_name, r.latitude, r.longitude);
      n := 1;
    ELSE
      -- 2) Varias ciudades: se separa por " y ", coma, punto y coma, "/", "&" o " - ".
      FOR part IN
        SELECT btrim(x) FROM regexp_split_to_table(p_city, '(?i)\s+y\s+|\s*[,;/&]\s*|\s+-\s+') AS x
      LOOP
        EXIT WHEN n >= 3;
        CONTINUE WHEN part = '';
        SELECT * INTO r FROM public.geo_resolve(part, p_country_code);
        IF NOT FOUND THEN
          bad := true;
          EXIT;
        END IF;
        CONTINUE WHEN r.place_id = ANY (seen);
        INSERT INTO public.faculty_places (faculty_id, position, geo_place_id, name, latitude, longitude)
        VALUES (p_faculty_id, n, r.place_id, r.place_name, r.latitude, r.longitude);
        seen := seen || r.place_id;
        n := n + 1;
      END LOOP;
      -- Una parte no reconocida: es más seguro no ubicar nada.
      IF bad THEN
        DELETE FROM public.faculty_places WHERE faculty_id = p_faculty_id;
        n := 0;
      END IF;
    END IF;
  END IF;

  -- La ciudad principal (posición 0) queda también en el perfil; sin ciudades
  -- reconocidas se limpian las coordenadas para no dejar datos de una ciudad antigua.
  SELECT * INTO primary_place FROM public.faculty_places WHERE faculty_id = p_faculty_id AND position = 0;
  UPDATE public.faculty_profiles
  SET latitude       = primary_place.latitude,
      longitude      = primary_place.longitude,
      geo_place_id   = primary_place.geo_place_id,
      geo_updated_at = now()
  WHERE id = p_faculty_id;

  RETURN n;
END;
$$;

-- ── 4. Cercanía: mira todas las ciudades del docente y devuelve la más cercana ─
DROP FUNCTION IF EXISTS public.faculty_ids_near(double precision, double precision, double precision);

CREATE FUNCTION public.faculty_ids_near(p_lat double precision, p_lng double precision, p_km double precision)
RETURNS TABLE (faculty_id uuid, km double precision, place_name text)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT t.faculty_id, t.km, t.name
  FROM (
    SELECT DISTINCT ON (fpl.faculty_id)
           fpl.faculty_id, fpl.name,
           geo_distance_km(p_lat, p_lng, fpl.latitude, fpl.longitude) AS km
    FROM public.faculty_places fpl
    WHERE fpl.latitude  BETWEEN p_lat - p_km / 111.2 AND p_lat + p_km / 111.2
      AND fpl.longitude BETWEEN p_lng - p_km / (111.2 * greatest(cos(radians(p_lat)), 0.01))
                            AND p_lng + p_km / (111.2 * greatest(cos(radians(p_lat)), 0.01))
      AND geo_distance_km(p_lat, p_lng, fpl.latitude, fpl.longitude) <= p_km
    ORDER BY fpl.faculty_id, km
  ) t
  ORDER BY t.km;
$$;

-- Solo el servidor las llama.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON FUNCTION public.geo_set_faculty_places(uuid, text, text) FROM PUBLIC, anon, authenticated;
    REVOKE ALL ON FUNCTION public.faculty_ids_near(double precision, double precision, double precision) FROM PUBLIC, anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.geo_set_faculty_places(uuid, text, text) TO service_role;
    GRANT EXECUTE ON FUNCTION public.faculty_ids_near(double precision, double precision, double precision) TO service_role;
  END IF;
END $$;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN — ejecutar APARTE, como segunda pasada (cada bloque por separado).
-- ============================================================================
--
-- 1) Se copiaron las ubicaciones principales. Esperado: 30 | 30 | 0
--    (docentes con coordenadas | filas en faculty_places | docentes con coordenadas sin fila)
-- SELECT (SELECT count(*) FROM public.faculty_profiles WHERE latitude IS NOT NULL) AS con_coordenadas,
--        (SELECT count(*) FROM public.faculty_places)                                AS filas_places,
--        (SELECT count(*) FROM public.faculty_profiles fp
--           WHERE fp.latitude IS NOT NULL
--             AND NOT EXISTS (SELECT 1 FROM public.faculty_places p WHERE p.faculty_id = fp.id)) AS sin_fila;
--
-- 2) La tabla tiene RLS y las funciones existen. Esperado: true | 2
-- SELECT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.faculty_places'::regclass) AS rls_activado,
--        (SELECT count(*) FROM pg_proc WHERE pronamespace = 'public'::regnamespace
--           AND proname IN ('geo_set_faculty_places', 'faculty_ids_near')) AS funciones;
--
-- 3) La cercanía funciona sobre los datos reales (Alicante, 30 km). Esperado: filas con km 0 y ~21
-- SELECT * FROM public.faculty_ids_near(38.3452, -0.4810, 30);
