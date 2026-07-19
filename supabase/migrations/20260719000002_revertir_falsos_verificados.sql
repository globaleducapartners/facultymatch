-- =============================================================================
-- FacultyMatch: Revertir falsos "verificado" activados por error post-consolidación
-- Date: 2026-07-19
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  APLICAR EN EL SQL EDITOR                                              ║
-- ║  Tras aplicarla, ejecutar verificaciones en la segunda pasada.         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Problema: 21 perfiles que la consolidación (20260718000002) dejó
-- correctamente en 'incompleto' (falsos aprobados del sistema viejo,
-- onboarding_status='not_started') fueron pasados a 'verificado' vía el
-- botón "Activar / Verificar" de /control/faculty/[id], cuya acción
-- (activateFaculty) no registraba verificado_por. Se identifican sin
-- ambigüedad porque tienen verificado_por IS NULL y verificado_en IS NULL,
-- mientras los 8 reales (7 de la consolidación + Fernando Miras Calatrava,
-- verificado legítimamente el 2026-07-18 vía el endpoint correcto) tienen
-- ambos campos poblados.
--
-- Además de revertir estado_perfil, is_verified y verificado_en/por, se
-- fuerza visibility='private': son perfiles que nunca completaron el
-- onboarding, coherente con lo que hace handle_new_user() para perfiles
-- nuevos (visibility='private' hasta que el usuario complete y publique).
--
-- Lista de 21 UUIDs confirmada por SELECT manual (ver conversación con
-- Miguel del 2026-07-19).
--
-- Corrección de código en el mismo despliegue (ya aplicada, no forma parte
-- de esta migración): activateFaculty() y PATCH /api/admin/faculty/[id]
-- ahora exigen verificado_por y bloquean/confirman activar perfiles con
-- onboarding_status != 'completed'.
-- =============================================================================

BEGIN;

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. BACKUP — snapshot antes de mutar
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.faculty_profiles_backup_20260719_revert AS
SELECT * FROM public.faculty_profiles
WHERE user_id IN (
  '0f33508c-5924-477c-b703-99b4dd6318e7', '4c12109f-e1f0-44f1-9f37-ab58fa12c89c',
  'cf371f23-64ce-43b6-a770-11d04500ddb6', '23794ef5-7e21-4e50-9ce6-5af9cd20eeef',
  '31bbd904-211a-4cc1-89f0-450f169c9f98', '3a673459-1622-49f9-a7ab-3480803af07b',
  '162f0e43-a540-4d78-a170-cdf6e9520ee4', '8cd74082-4654-4003-806d-44fcb9bb85b5',
  'fe0f4538-c10f-4ca9-a265-a0c75319d5f9', 'dc4b4b60-2bb0-4c2e-98ed-ed47b1aa7f09',
  '6e1c2ebb-7901-4039-814e-a6efb58e3315', 'c03bc030-0c6b-4d24-b307-c00701cfc86e',
  '7f633802-b032-4d07-bda7-fadc6b56e823', 'eb3ad05f-8afe-4f48-a551-d2671655b945',
  '13ed809d-f633-462d-a8ee-5b8a113af508', '009231b5-6682-4538-84c1-8ee018050972',
  '1012e175-d4b3-485d-8f89-5f24bf833374', '27517024-7b72-457c-91c4-4705aae47ade',
  'fad7119c-e61d-40cb-b149-d57b088a3625', '619b504c-d220-4ca8-a39e-6d4ff9928fc3',
  '76a81fda-dc19-4444-a2f3-40a220b80ac2'
);

ALTER TABLE public.faculty_profiles_backup_20260719_revert ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. Revertir a 'incompleto' — solo estas 21 filas, doble condición de seguridad
-- ═════════════════════════════════════════════════════════════════════════════

UPDATE public.faculty_profiles
SET estado_perfil  = 'incompleto',
    is_verified    = false,
    verificado_en  = NULL,
    verificado_por = NULL,
    visibility     = 'private'
WHERE user_id IN (
  '0f33508c-5924-477c-b703-99b4dd6318e7', '4c12109f-e1f0-44f1-9f37-ab58fa12c89c',
  'cf371f23-64ce-43b6-a770-11d04500ddb6', '23794ef5-7e21-4e50-9ce6-5af9cd20eeef',
  '31bbd904-211a-4cc1-89f0-450f169c9f98', '3a673459-1622-49f9-a7ab-3480803af07b',
  '162f0e43-a540-4d78-a170-cdf6e9520ee4', '8cd74082-4654-4003-806d-44fcb9bb85b5',
  'fe0f4538-c10f-4ca9-a265-a0c75319d5f9', 'dc4b4b60-2bb0-4c2e-98ed-ed47b1aa7f09',
  '6e1c2ebb-7901-4039-814e-a6efb58e3315', 'c03bc030-0c6b-4d24-b307-c00701cfc86e',
  '7f633802-b032-4d07-bda7-fadc6b56e823', 'eb3ad05f-8afe-4f48-a551-d2671655b945',
  '13ed809d-f633-462d-a8ee-5b8a113af508', '009231b5-6682-4538-84c1-8ee018050972',
  '1012e175-d4b3-485d-8f89-5f24bf833374', '27517024-7b72-457c-91c4-4705aae47ade',
  'fad7119c-e61d-40cb-b149-d57b088a3625', '619b504c-d220-4ca8-a39e-6d4ff9928fc3',
  '76a81fda-dc19-4444-a2f3-40a220b80ac2'
)
AND estado_perfil = 'verificado'
AND verificado_por IS NULL;   -- cinturón de seguridad: nunca toca a los 8 reales

-- Reload schema cache
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ═════════════════════════════════════════════════════════════════════════════
-- VERIFICACIONES (ejecutar como segunda pasada)
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. Debe dar: incompleto 22, verificado 8
-- SELECT estado_perfil, count(*) FROM faculty_profiles GROUP BY 1 ORDER BY 1;

-- 2. Debe devolver exactamente los 8 reales (verificado_por poblado)
-- SELECT user_id, verificado_por, verificado_en FROM faculty_profiles
-- WHERE estado_perfil = 'verificado' ORDER BY verificado_en;

-- 3. Ningún perfil 'verificado' debe quedar sin verificado_por (regresión futura)
-- SELECT count(*) FROM faculty_profiles WHERE estado_perfil='verificado' AND verificado_por IS NULL;
-- Debe dar 0

-- 4. Las 21 filas revertidas no deben quedar con visibility='public'
-- SELECT count(*) FROM faculty_profiles
-- WHERE user_id IN (
--   '0f33508c-5924-477c-b703-99b4dd6318e7', '4c12109f-e1f0-44f1-9f37-ab58fa12c89c',
--   'cf371f23-64ce-43b6-a770-11d04500ddb6', '23794ef5-7e21-4e50-9ce6-5af9cd20eeef',
--   '31bbd904-211a-4cc1-89f0-450f169c9f98', '3a673459-1622-49f9-a7ab-3480803af07b',
--   '162f0e43-a540-4d78-a170-cdf6e9520ee4', '8cd74082-4654-4003-806d-44fcb9bb85b5',
--   'fe0f4538-c10f-4ca9-a265-a0c75319d5f9', 'dc4b4b60-2bb0-4c2e-98ed-ed47b1aa7f09',
--   '6e1c2ebb-7901-4039-814e-a6efb58e3315', 'c03bc030-0c6b-4d24-b307-c00701cfc86e',
--   '7f633802-b032-4d07-bda7-fadc6b56e823', 'eb3ad05f-8afe-4f48-a551-d2671655b945',
--   '13ed809d-f633-462d-a8ee-5b8a113af508', '009231b5-6682-4538-84c1-8ee018050972',
--   '1012e175-d4b3-485d-8f89-5f24bf833374', '27517024-7b72-457c-91c4-4705aae47ade',
--   'fad7119c-e61d-40cb-b149-d57b088a3625', '619b504c-d220-4ca8-a39e-6d4ff9928fc3',
--   '76a81fda-dc19-4444-a2f3-40a220b80ac2'
-- )
-- AND visibility = 'public';
-- Debe dar 0
