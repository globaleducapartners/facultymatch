-- =============================================================================
-- FacultyMatch: estado_perfil + activation_tokens
-- Date: 2026-07-18
--
-- 1. Backup existing faculty_profiles before any mutation
-- 2. Add estado_perfil column with full lifecycle CHECK constraint
-- 3. Create activation_tokens table (SHA-256 hash, not plaintext)
-- 4. Backfill existing users so none is left in pendiente_verificacion
-- 5. Indexes + RLS
--
-- ⚠️ APPLIED MANUALLY on 2026-07-18 via Supabase SQL Editor.
--    If you ever adopt `supabase db push`, repair with:
--      supabase migration repair --status applied 20260718000001
-- =============================================================================

BEGIN;

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. BACKUP — snapshot before mutation
-- ═════════════════════════════════════════════════════════════════════════════
-- RLS is enabled WITHOUT any policies so the table is invisible via PostgREST.
-- Schedule a cleanup migration after 7–14 days of confirming everything works.

CREATE TABLE IF NOT EXISTS public.faculty_profiles_backup_20260718 AS
SELECT * FROM public.faculty_profiles;

ALTER TABLE public.faculty_profiles_backup_20260718 ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. estado_perfil column
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS estado_perfil text;

-- Full lifecycle constraint — includes all future states
-- so we never need to alter this CHECK, only add transitions
UPDATE public.faculty_profiles
SET estado_perfil = 'pendiente_verificacion'
WHERE estado_perfil IS NULL;

ALTER TABLE public.faculty_profiles
  ALTER COLUMN estado_perfil SET NOT NULL,
  ALTER COLUMN estado_perfil SET DEFAULT 'pendiente_verificacion';

-- CHECK constraint covering the complete lifecycle
ALTER TABLE public.faculty_profiles
  ADD CONSTRAINT faculty_profiles_estado_perfil_check
  CHECK (estado_perfil = ANY (ARRAY[
    'pendiente_verificacion',  -- Token no canjeado
    'incompleto',              -- Email OK, onboarding sin terminar
    'activo',                  -- Legacy / activación directa
    'en_revision',             -- Onboarding completado, pendiente revisión admin
    'verificado',              -- Aprobado por admin
    'rechazado',               -- Rechazado por admin
    'suspendido'               -- Suspendido por admin
  ]));

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. activation_tokens table
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.activation_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,          -- SHA-256 hex digest, never plaintext
  used       boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Unique constraint on hash ensures we never have duplicate tokens
-- (statistically impossible with SHA-256, but belt-and-suspenders)
CREATE UNIQUE INDEX IF NOT EXISTS idx_activation_tokens_hash
  ON public.activation_tokens (token_hash);

-- Fast lookup when invalidating all tokens for a user (re-send scenario)
CREATE INDEX IF NOT EXISTS idx_activation_tokens_user_id
  ON public.activation_tokens (user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. BACKFILL — existing users
-- ═════════════════════════════════════════════════════════════════════════════
-- Users that already completed onboarding → activo
-- Users with incomplete or no onboarding → incompleto
-- NEVER leave an existing user in pendiente_verificacion

UPDATE public.faculty_profiles
SET estado_perfil = 'activo'
WHERE onboarding_status = 'completed'
  AND estado_perfil = 'pendiente_verificacion';

UPDATE public.faculty_profiles
SET estado_perfil = 'incompleto'
WHERE (onboarding_status IS NULL
       OR onboarding_status IN ('not_started', 'in_progress'))
  AND estado_perfil = 'pendiente_verificacion';

-- ═════════════════════════════════════════════════════════════════════════════
-- 4b. VERIFICATION — must return 0 rows
-- ═════════════════════════════════════════════════════════════════════════════
-- Any row here means a user was left in the default state, which would block
-- them from accessing the app. This is a safety net for the backfill logic.

SELECT count(*) AS usuarios_legacy_bloqueados
FROM public.faculty_profiles
WHERE estado_perfil = 'pendiente_verificacion';

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. RLS for activation_tokens
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.activation_tokens ENABLE ROW LEVEL SECURITY;

-- Users can read their own tokens (needed in /auth/activar to verify)
DROP POLICY IF EXISTS activation_tokens_select_own ON public.activation_tokens;
CREATE POLICY activation_tokens_select_own
  ON public.activation_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only the server-side admin client inserts tokens, no RLS needed for INSERT.
-- Only the server-side admin client updates tokens (mark as used).
-- No DELETE policy needed — tokens are never deleted, only invalidated.

-- ═════════════════════════════════════════════════════════════════════════════

-- Reload schema cache so Supabase picks up the new column
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;