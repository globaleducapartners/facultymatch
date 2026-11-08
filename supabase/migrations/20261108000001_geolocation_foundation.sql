-- ============================================================================
-- Migración: base de la búsqueda geográfica (Fase 1 — datos)
-- Fecha: 2026-11-08
--
-- Motivo: hoy el filtro de ubicación solo busca texto ("Alicante" dentro de
-- "Alicante, España"). No sabe que Elche está a 25 km de Alicante, así que
-- una institución no puede pedir "docentes verificados a 50 km de mi campus".
--
-- Esta migración añade, sin tocar ningún dato existente:
--   · geo_places: tabla de ciudades del mundo con más de 5.000 habitantes
--     (GeoNames, https://www.geonames.org, licencia CC BY 4.0 — la atribución
--     va en /creditos). Se rellena DESPUÉS con scripts/load-geonames.ts.
--     Incluye nombres alternativos ("Alacant", "La Coruña"), que se normalizan
--     (sin tildes ni mayúsculas) para encontrar la ciudad aunque esté mal escrita.
--   · latitud/longitud (+ geo_place_id y geo_updated_at) en faculty_profiles e
--     institutions. Son coordenadas del CENTRO DE LA CIUDAD, nunca una
--     dirección. Quedan vacías hasta el rellenado (scripts/geocode-profiles.ts).
--   · geo_norm(): normaliza texto (sin tildes, minúsculas).
--   · geo_resolve(ciudad, país): devuelve la ciudad más poblada que coincide.
--   · geo_distance_km(): distancia en km entre dos puntos (fórmula de Haversine).
--   · faculty_ids_near(lat, lng, km): docentes con coordenadas dentro del radio.
--     Solo la puede llamar el servidor (service_role), nunca el navegador.
--
-- Esta migración NO modifica filas existentes: solo crea una tabla vacía,
-- columnas nuevas (NULL) y funciones. No hace falta copia de seguridad. El
-- código desplegado sigue funcionando igual con o sin ella.
--
-- Aplicada en producción: PENDIENTE (anotar aquí la fecha cuando se aplique).
-- ============================================================================

BEGIN;

-- unaccent puede estar en `extensions` (Supabase) o en `public`.
SET LOCAL search_path = public, extensions;

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

-- ── 1. Normalización de nombres ─────────────────────────────────────────────
-- Minúsculas, sin tildes, solo letras/números/espacios. "Alicante." → "alicante".
CREATE OR REPLACE FUNCTION public.geo_norm(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public, extensions
AS $$
  SELECT btrim(regexp_replace(lower(unaccent(coalesce(p, ''))), '[^a-z0-9]+', ' ', 'g'));
$$;

-- ── 2. Tabla de ciudades ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.geo_places (
  id           bigint PRIMARY KEY,              -- geonameid
  name         text NOT NULL,
  country_code char(2) NOT NULL,                -- ISO 3166-1 alfa-2 ("ES")
  admin1_code  text,                            -- código de región/provincia de GeoNames
  population   integer NOT NULL DEFAULT 0,
  latitude     double precision NOT NULL,
  longitude    double precision NOT NULL,
  alt_names    text[] NOT NULL DEFAULT '{}',    -- entrada de la carga: nombres alternativos (se vacía al guardar)
  search_names text[] NOT NULL DEFAULT '{}'     -- nombre + alternativos normalizados (lo rellena el trigger)
);

-- search_names = nombre + alternativos normalizados, solo alfabeto latino.
-- Después se vacía alt_names: solo hace falta lo normalizado (ahorra espacio).
CREATE OR REPLACE FUNCTION public.geo_places_set_search_names()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  NEW.search_names := ARRAY(
    SELECT DISTINCT n
    FROM (
      SELECT geo_norm(x) AS n FROM unnest(ARRAY[NEW.name] || NEW.alt_names) AS x
    ) t
    WHERE n ~ '^[a-z0-9 ]+$' AND length(n) BETWEEN 2 AND 60
  );
  NEW.alt_names := '{}';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS geo_places_search_names ON public.geo_places;
CREATE TRIGGER geo_places_search_names
  BEFORE INSERT OR UPDATE OF name, alt_names ON public.geo_places
  FOR EACH ROW EXECUTE FUNCTION public.geo_places_set_search_names();

CREATE INDEX IF NOT EXISTS geo_places_search_names_idx ON public.geo_places USING gin (search_names);

-- Sin políticas: solo el servidor (service_role) puede leerla o escribirla.
ALTER TABLE public.geo_places ENABLE ROW LEVEL SECURITY;

-- ── 3. Coordenadas en docentes e instituciones (todas NULL de momento) ─────
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS latitude       double precision,
  ADD COLUMN IF NOT EXISTS longitude      double precision,
  ADD COLUMN IF NOT EXISTS geo_place_id   bigint REFERENCES public.geo_places(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS geo_updated_at timestamptz;

ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS latitude       double precision,
  ADD COLUMN IF NOT EXISTS longitude      double precision,
  ADD COLUMN IF NOT EXISTS geo_place_id   bigint REFERENCES public.geo_places(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS geo_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS faculty_profiles_lat_lng_idx ON public.faculty_profiles (latitude, longitude)
  WHERE latitude IS NOT NULL;

-- ── 4. Funciones ────────────────────────────────────────────────────────────
-- Distancia en km entre dos puntos (Haversine, radio terrestre 6.371 km).
CREATE OR REPLACE FUNCTION public.geo_distance_km(lat1 double precision, lng1 double precision,
                                                   lat2 double precision, lng2 double precision)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT 2 * 6371 * asin(least(1.0, sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  )));
$$;

-- Ciudad más poblada que coincide con el nombre (y país, si se indica).
-- "Elche (Alicante)" → se ignora lo que va entre paréntesis. Si no hay una
-- coincidencia exacta, no devuelve nada (mejor sin coordenadas que equivocadas).
CREATE OR REPLACE FUNCTION public.geo_resolve(p_name text, p_country_code text DEFAULT NULL)
RETURNS TABLE (
  place_id     bigint,
  place_name   text,
  country_code char(2),
  latitude     double precision,
  longitude    double precision,
  population   integer
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT g.id, g.name, g.country_code, g.latitude, g.longitude, g.population
  FROM public.geo_places g
  WHERE geo_norm(regexp_replace(coalesce(p_name, ''), '\([^)]*\)', '', 'g')) <> ''
    AND g.search_names @> ARRAY[geo_norm(regexp_replace(coalesce(p_name, ''), '\([^)]*\)', '', 'g'))]
    AND (p_country_code IS NULL OR g.country_code = upper(p_country_code))
  ORDER BY g.population DESC, g.id
  LIMIT 1;
$$;

-- Docentes con coordenadas a ≤ p_km km de un punto, con su distancia.
-- Prefiltro por caja (barato) y después Haversine exacto.
CREATE OR REPLACE FUNCTION public.faculty_ids_near(p_lat double precision, p_lng double precision, p_km double precision)
RETURNS TABLE (faculty_id uuid, km double precision)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT fp.id, geo_distance_km(p_lat, p_lng, fp.latitude, fp.longitude) AS km
  FROM public.faculty_profiles fp
  WHERE fp.latitude IS NOT NULL AND fp.longitude IS NOT NULL
    AND fp.latitude  BETWEEN p_lat - p_km / 111.2 AND p_lat + p_km / 111.2
    AND fp.longitude BETWEEN p_lng - p_km / (111.2 * greatest(cos(radians(p_lat)), 0.01))
                         AND p_lng + p_km / (111.2 * greatest(cos(radians(p_lat)), 0.01))
    AND geo_distance_km(p_lat, p_lng, fp.latitude, fp.longitude) <= p_km
  ORDER BY km;
$$;

-- Solo el servidor las llama: que el navegador no pueda listar coordenadas.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON FUNCTION public.geo_resolve(text, text) FROM PUBLIC, anon, authenticated;
    REVOKE ALL ON FUNCTION public.faculty_ids_near(double precision, double precision, double precision) FROM PUBLIC, anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.geo_resolve(text, text) TO service_role;
    GRANT EXECUTE ON FUNCTION public.faculty_ids_near(double precision, double precision, double precision) TO service_role;
  END IF;
END $$;

-- Que la API vea las columnas y funciones nuevas sin esperar.
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN — ejecutar APARTE, como segunda pasada (el SQL Editor solo
-- muestra el resultado de la última consulta; ejecuta cada bloque por separado).
-- ============================================================================
--
-- 1) La tabla existe, está vacía y tiene RLS activado. Esperado: 0 | true
-- SELECT (SELECT count(*) FROM public.geo_places) AS ciudades,
--        (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.geo_places'::regclass) AS rls_activado;
--
-- 2) Las columnas nuevas existen en las dos tablas. Esperado: 8 filas
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name IN ('faculty_profiles', 'institutions')
--   AND column_name IN ('latitude', 'longitude', 'geo_place_id', 'geo_updated_at')
-- ORDER BY table_name, column_name;
--
-- 3) Las funciones existen. Esperado: 5 filas
-- SELECT proname FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
--   AND proname IN ('geo_norm', 'geo_distance_km', 'geo_resolve', 'faculty_ids_near', 'geo_places_set_search_names')
-- ORDER BY proname;
--
-- 4) Ningún docente ni institución tiene coordenadas todavía. Esperado: 0 | 0
-- SELECT (SELECT count(latitude) FROM public.faculty_profiles) AS docentes_con_coordenadas,
--        (SELECT count(latitude) FROM public.institutions)     AS instituciones_con_coordenadas;
--
-- 5) Prueba de la distancia (Alicante – Elche ≈ 20 km). Esperado: ~ 19–21
-- SELECT round(public.geo_distance_km(38.3452, -0.4810, 38.2669, -0.6985)::numeric, 1) AS km_alicante_elche;
