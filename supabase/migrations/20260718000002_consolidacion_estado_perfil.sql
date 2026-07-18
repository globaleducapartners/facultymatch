-- =============================================================================
-- FacultyMatch: Consolidación — estado_perfil como única fuente de verdad
-- Date: 2026-07-18
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  PRIMERA PASADA: Pasos 1-6 (ejecutar en SQL Editor)                    ║
-- ║  SEGUNDA PASADA:  archivo separado 20260718000002_verificaciones.sql   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Corrección del backfill de la Fase 1 (20260718000001):
--   El backfill anterior usó `onboarding_status` para decidir entre 'activo'
--   e 'incompleto', ignorando `user_profiles.verification_status`. Esto dejó
--   a usuarios verificados con estado 'activo' en lugar de 'verificado'.
--
-- ⚠️  Los 28 perfiles con verification_status='approved' NO son todos reales.
--     Solo 6 completaron onboarding (onboarding_status='completed').
--     Los otros 22 son falsos aprobados (default engañoso del sistema antiguo)
--     y deben quedarse en 'incompleto'.
--
-- Esta migración:
--   1. Backups faculty_profiles antes de mutar
--   2. Añade verificado_por (uuid), verificado_en (timestamptz) y verification_notes
--   3. Corrige estado_perfil: approved + onboarding completado → 'verificado';
--      el resto se queda en 'incompleto' (corrige Fase 1)
--   3b. Reset defensivo de is_verified = false (excepto perfiles reales)
--   4. Backfill de is_verified, verificado_por, verificado_en (solo perfiles reales)
--   5. Crea faculty_profiles para usuarios existentes que faltan
--   6. Marca verification_status como deprecated (comentario en columna)
--
-- ⚠️  APLICAR EN DOS PASADAS en el Supabase SQL Editor:
--     1ª pasada: este archivo (Pasos 1-6, terminan en COMMIT)
--     2ª pasada: 20260718000002_verificaciones.sql (solo SELECTs)
--
-- ⚠️  Si adoptas `supabase db push`, repara con:
--       supabase migration repair --status applied 20260718000002
-- =============================================================================

BEGIN;

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. BACKUP — snapshot antes de mutar
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.faculty_profiles_backup_20260718_b AS
SELECT * FROM public.faculty_profiles;

ALTER TABLE public.faculty_profiles_backup_20260718_b ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. Añadir columnas a faculty_profiles
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS verificado_por    uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verificado_en     timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text;

COMMENT ON COLUMN public.faculty_profiles.verificado_por IS
  'UUID del admin que aprobó/rechazó el perfil. REFERENCES auth.users(id).';

COMMENT ON COLUMN public.faculty_profiles.verificado_en IS
  'Timestamp de cuando el admin aprobó/rechazó el perfil.';

COMMENT ON COLUMN public.faculty_profiles.verification_notes IS
  'Notas internas del admin durante la revisión.';

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. Corregir estado_perfil desde user_profiles.verification_status
-- ═════════════════════════════════════════════════════════════════════════════
-- Mapeo:
--   verification_status = 'approved' + fp.onboarding_status = 'completed'
--                         → estado_perfil = 'verificado'
--   verification_status = 'approved' + fp.onboarding_status != 'completed'
--                         → se queda 'incompleto' (falso aprobado)
--   verification_status = 'rejected'    → estado_perfil = 'rechazado'
--   verification_status = 'requires_info' → estado_perfil = 'incompleto'
--   verification_status = 'pending' con onboarding completado → 'en_revision'
--   verification_status = 'pending' sin onboarding completado → 'incompleto'
--   NULL → 'incompleto'

-- Approved + onboarding completado → verificado
UPDATE public.faculty_profiles fp
SET estado_perfil = 'verificado'
FROM public.user_profiles up
WHERE up.id = fp.user_id
  AND up.role = 'faculty'
  AND up.verification_status = 'approved'
  AND fp.onboarding_status = 'completed';

-- Approved sin onboarding completado → se queda incompleto (no-op, ya está)
--   Los 22 falsos aprobados se quedan como están.

-- Rejected → rechazado
UPDATE public.faculty_profiles fp
SET estado_perfil = 'rechazado'
FROM public.user_profiles up
WHERE up.id = fp.user_id
  AND up.role = 'faculty'
  AND up.verification_status = 'rejected';

-- requires_info → incompleto (el usuario debe editar y re-publicar)
UPDATE public.faculty_profiles fp
SET estado_perfil = 'incompleto'
FROM public.user_profiles up
WHERE up.id = fp.user_id
  AND up.role = 'faculty'
  AND up.verification_status = 'requires_info';

-- pending con onboarding completado → en_revision
UPDATE public.faculty_profiles fp
SET estado_perfil = 'en_revision'
FROM public.user_profiles up
WHERE up.id = fp.user_id
  AND up.role = 'faculty'
  AND up.verification_status = 'pending'
  AND fp.onboarding_status = 'completed';

-- pending sin onboarding completado → incompleto (no-op, ya está)
-- NULL → incompleto (no-op, ya está)

-- ═════════════════════════════════════════════════════════════════════════════
-- 3b. RESET DEFENSIVO — is_verified = false para todo perfil no legítimo
-- ═════════════════════════════════════════════════════════════════════════════
-- No podemos asumir que los falsos aprobados tienen is_verified = false;
-- el sistema viejo pudo ponerlo a true. Limpiamos antes del backfill real.
--
-- Solo se salvan los que cumplen: approved + onboarding completado
-- (esos se rellenan en el Paso 4).

UPDATE public.faculty_profiles fp
SET is_verified = false
FROM public.user_profiles up
WHERE up.id = fp.user_id
  AND up.role = 'faculty'
  AND NOT (up.verification_status = 'approved' AND fp.onboarding_status = 'completed');

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. Backfill is_verified, verificado_por, verificado_en, verification_notes
-- ═════════════════════════════════════════════════════════════════════════════
-- Solo para perfiles realmente verificados: approved + onboarding completado

UPDATE public.faculty_profiles fp
SET
  is_verified        = true,
  verificado_por     = (SELECT id FROM auth.users WHERE email = up.verified_by LIMIT 1),
  verificado_en      = up.verified_at,
  verification_notes = up.verification_notes
FROM public.user_profiles up
WHERE up.id = fp.user_id
  AND up.role = 'faculty'
  AND up.verification_status = 'approved'
  AND fp.onboarding_status = 'completed';

-- Los perfiles falsos aprobados ya tienen is_verified = false (Paso 3b).

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. Crear faculty_profiles para usuarios existentes que faltan
-- ═════════════════════════════════════════════════════════════════════════════
-- Usuarios con role=faculty en user_profiles pero SIN fila en faculty_profiles
-- (actualmente solo 1: Laura Matilla, que tiene onboarding_completed = true)
--
-- Los perfiles incompletos se crean con visibility='private' e is_active=false
-- para que no queden vacíos visibles en el directorio.

INSERT INTO public.faculty_profiles (id, user_id, visibility, is_active, is_verified,
                                     onboarding_status, estado_perfil, verificado_por, verificado_en,
                                     verification_notes)
SELECT
  up.id,
  up.id,
  -- Solo público si está realmente verificado
  CASE WHEN up.verification_status = 'approved' AND up.onboarding_completed = true
    THEN 'public'::visibility_mode ELSE 'private'::visibility_mode
  END,
  -- Solo activo si está realmente verificado
  CASE WHEN up.verification_status = 'approved' AND up.onboarding_completed = true
    THEN true ELSE false
  END,
  -- is_verified solo si es un perfil real verificado
  CASE WHEN up.verification_status = 'approved' AND up.onboarding_completed = true
    THEN true ELSE false
  END,
  -- onboarding_status desde user_profiles (no hay faculty_profiles aún)
  CASE WHEN up.onboarding_completed = true THEN 'completed' ELSE 'not_started' END,
  -- estado_perfil
  CASE
    WHEN up.verification_status = 'approved' AND up.onboarding_completed = true THEN 'verificado'
    WHEN up.verification_status = 'rejected'  THEN 'rechazado'
    WHEN up.verification_status = 'requires_info' THEN 'incompleto'
    WHEN up.verification_status = 'pending' AND up.onboarding_completed = true THEN 'en_revision'
    ELSE 'incompleto'
  END,
  -- verificado_por: solo para perfiles reales verificados
  CASE WHEN up.verification_status = 'approved' AND up.onboarding_completed = true
    THEN (SELECT id FROM auth.users WHERE email = up.verified_by LIMIT 1)
    ELSE NULL
  END,
  up.verified_at,
  up.verification_notes
FROM public.user_profiles up
WHERE up.role = 'faculty'
  AND NOT EXISTS (SELECT 1 FROM public.faculty_profiles fp WHERE fp.user_id = up.id);

-- ═════════════════════════════════════════════════════════════════════════════
-- 6. Marcar verification_status como deprecated (comentario en columna)
-- ═════════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.user_profiles.verification_status IS
  '⚠️ DEPRECATED — usar faculty_profiles.estado_perfil en su lugar. Se eliminará en una migración futura.';

COMMENT ON COLUMN public.user_profiles.verified_by IS
  '⚠️ DEPRECATED — usar faculty_profiles.verificado_por en su lugar.';

COMMENT ON COLUMN public.user_profiles.verified_at IS
  '⚠️ DEPRECATED — usar faculty_profiles.verificado_en en su lugar.';

-- ═════════════════════════════════════════════════════════════════════════════

-- Reload schema cache
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;