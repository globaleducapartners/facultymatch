-- Migration: columnas de atribución de adquisición en user_profiles
-- 2026-09-28
--
-- El panel de admin (/control/metrics, sección "Canales de adquisición")
-- y el endpoint POST /api/acquisition (src/app/api/acquisition/route.ts)
-- ya usan estas 5 columnas desde hace tiempo, pero nunca se crearon: el
-- INSERT del cliente (src/lib/acquisition.ts) fallaba en silencio contra
-- una columna inexistente, y la sección de Métricas salía siempre vacía.
--
-- Aditiva pura: 5 columnas nullable nuevas, sin tocar filas existentes.
-- No hace falta backfill (los usuarios ya registrados simplemente no
-- tendrán canal de adquisición, como ahora) ni backup.
--
-- Estado: PENDIENTE de aplicar (pegar en el SQL Editor de Supabase).

BEGIN;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS acquisition_channel text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS referrer_url text;

COMMIT;

-- ─── VERIFICACIÓN (ejecutar como SEGUNDA pasada, aparte) ───────────────
-- SELECT count(*) FROM user_profiles WHERE acquisition_channel IS NOT NULL;
-- Debe funcionar sin error (antes de esta migración, daba error de
-- columna inexistente). El count puede ser 0: es normal, se rellena solo
-- según se registre gente nueva.
