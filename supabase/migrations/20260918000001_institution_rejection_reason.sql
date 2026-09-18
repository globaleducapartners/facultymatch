-- ============================================================================
-- Migración: motivo de rechazo de una institución
-- Fecha: 2026-09-18
--
-- Motivo: el botón "Rechazar" en /control/institutions solo cambiaba
-- status='rejected' — no guardaba por qué, ni avisaba a la institución
-- (a diferencia de "Aprobar", que sí manda un correo). Miguel estaba
-- escribiendo el aviso a mano en Thunderbird cada vez.
--
-- Se añaden dos columnas a institutions:
--   rejection_reason  — el motivo que escribe el admin al rechazar, se
--                       inserta en el correo automático que ahora se manda
--   rejected_at       — cuándo se rechazó (igual que ya existe verified_at
--                       para las aprobadas)
--
-- SIN backfill: las filas ya rechazadas antes de esta migración se quedan
-- con estos dos campos en NULL — no sabemos el motivo de esas, y no hace
-- falta inventarlo.
-- ============================================================================

BEGIN;

ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Las columnas existen y todas las filas están sin registro todavía:
--    SELECT count(*) FILTER (WHERE rejection_reason IS NOT NULL) AS con_motivo,
--           count(*) FILTER (WHERE status = 'rejected') AS rechazadas_total
--    FROM public.institutions;
--    (esperado justo tras la migración: con_motivo = 0)
--
-- 2. A medida que se vaya usando, ver los rechazos con su motivo:
--    SELECT name, contact_email, rejected_at, rejection_reason
--    FROM public.institutions
--    WHERE status = 'rejected'
--    ORDER BY rejected_at DESC NULLS LAST;
