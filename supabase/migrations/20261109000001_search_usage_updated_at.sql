-- ============================================================================
-- Migración: arreglar el contador de búsquedas de las instituciones gratuitas
-- Fecha: 2026-11-09
--
-- Problema: la función increment_search_usage (migración 20260801000002) hace
-- UPDATE search_usage SET ..., updated_at = now(), pero la tabla search_usage
-- ya existía de antes SIN esa columna, así que el CREATE TABLE IF NOT EXISTS de
-- aquella migración no la añadió. Resultado: la función falla con
--   column "updated_at" of relation "search_usage" does not exist
-- y la pantalla de búsqueda interpreta el fallo como «límite alcanzado»: toda
-- institución con plan gratuito veía «Has alcanzado el límite de 5 búsquedas»
-- y 0 resultados en cualquier búsqueda con filtros. (Las instituciones con plan
-- Professional no pasan por este contador y no se veían afectadas.)
--
-- Arreglo: añadir la columna que falta. No cambia ningún dato existente (las
-- filas actuales reciben la fecha de hoy) ni la función.
--
-- Aplicada en producción: PENDIENTE (anotar aquí la fecha cuando se aplique).
-- ============================================================================

BEGIN;

ALTER TABLE public.search_usage
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN — ejecutar APARTE, como segunda pasada.
-- ============================================================================
--
-- 1) La columna existe. Esperado: 1 fila (updated_at | timestamp with time zone)
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'search_usage' AND column_name = 'updated_at';
--
-- 2) La función ya no falla (comprobarlo desde la web: una institución gratuita
--    debe poder buscar con filtros hasta 5 veces al mes).
