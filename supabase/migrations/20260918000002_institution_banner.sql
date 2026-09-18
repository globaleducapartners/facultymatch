-- Migration: banner_url para instituciones
-- 2026-09-18
--
-- Añade a `institutions` el mismo campo que ya tiene `faculty_profiles`
-- (ver 20260601000001_domain_blocking_and_banner.sql) para que las
-- instituciones puedan subir una foto de portada real en vez del
-- degradado fijo actual. Reutiliza el bucket de storage "banners" que
-- ya existe y ya es público con esas mismas políticas — no hace falta
-- tocar storage.
--
-- Es un ALTER TABLE aditivo (columna nueva, nullable, sin backfill:
-- las instituciones existentes simplemente no tendrán banner hasta que
-- lo suban, y la UI ya sabe mostrar el degradado por defecto en ese
-- caso). No mutamos filas existentes, así que no hace falta backup.

BEGIN;

ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

COMMIT;

-- ── Verificación (ejecutar aparte, después del COMMIT) ─────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'institutions' AND column_name = 'banner_url';
-- → debe devolver una fila: banner_url | text
