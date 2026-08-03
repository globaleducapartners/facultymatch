-- ============================================================================
-- Migración: columnas para el premio automático del programa de referidos
-- Fecha: 2026-08-03
--
-- Motivo: el programa "Invita y Gana" (1 año Professional gratis al llegar
-- a 10 referidos exitosos) estaba roto de principio a fin — nada en el
-- código marcaba jamás un referido como "exitoso" ni entregaba el premio.
-- Se ha arreglado el flujo completo (enlace → registro → verificación →
-- premio); esta migración añade las columnas que ese código nuevo necesita:
--
-- 1. faculty_profiles.referral_reward_counted (por cada docente REFERIDO):
--    evita contar dos veces al mismo referido si su perfil pasa de
--    verificado → rechazado → verificado otra vez.
-- 2. faculty_profiles.referral_reward_granted_at (por cada docente que
--    INVITA): evita entregar el premio más de una vez si sigue invitando
--    después de llegar a 10.
-- 3. user_profiles.plan_source ('stripe' | 'referral' | NULL): distingue un
--    plan de pago real (puesto por el webhook de Stripe) de un plan
--    entregado gratis como premio de referidos — así el nuevo cron diario
--    que revierte el premio al año solo toca cuentas con plan_source =
--    'referral', nunca a un cliente que además ya paga de verdad.
--
-- Backfill: cualquier cuenta que YA tenga un plan de pago activo (con
-- stripe_subscription_id) se marca como plan_source = 'stripe' — así el
-- cron de expiración no las toca por error desde el primer día.
-- ============================================================================

BEGIN;

ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS referral_reward_counted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_reward_granted_at TIMESTAMPTZ;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS plan_source TEXT;

UPDATE public.user_profiles
SET plan_source = 'stripe'
WHERE plan <> 'free'
  AND stripe_subscription_id IS NOT NULL
  AND plan_source IS NULL;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Las columnas existen:
--    SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'faculty_profiles' AND column_name IN ('referral_reward_counted', 'referral_reward_granted_at');
--    SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'user_profiles' AND column_name = 'plan_source';
--    Debe devolver 2 filas y 1 fila respectivamente.
--
-- 2. El backfill marcó a los clientes de pago reales existentes:
--    SELECT id, plan, subscription_status, plan_source FROM public.user_profiles
--    WHERE stripe_subscription_id IS NOT NULL;
--    Todas las filas deben tener plan_source = 'stripe'.
