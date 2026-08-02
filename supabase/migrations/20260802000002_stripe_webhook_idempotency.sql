-- ============================================================================
-- Migración: idempotencia del webhook de Stripe
-- Fecha: 2026-08-02
--
-- Motivo: el webhook (src/app/api/stripe/webhook/route.ts) no tenía ninguna
-- protección contra reintentos. Stripe reintenta la entrega de un evento si
-- no recibe una respuesta 2xx a tiempo (timeout, caída puntual, etc.) — con
-- el código tal cual estaba, un reintento volvía a escribir en la base de
-- datos y reenviaba el email de bienvenida/renovación por segunda vez.
--
-- Esta tabla guarda el id de cada evento de Stripe ya procesado. El
-- webhook comprueba si el evento ya existe antes de procesarlo, y lo
-- inserta nada más pasar la verificación de firma — si el mismo evento
-- llega dos veces, la segunda vez se ignora sin repetir ningún efecto
-- secundario (escritura en BD, email).
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id     text PRIMARY KEY,
  event_type   text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- Sin policies para 'authenticated': solo el service role (el webhook,
-- que no pasa por sesión de usuario) debe tocar esta tabla.

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. La tabla existe:
--    SELECT count(*) FROM public.stripe_webhook_events;
--
-- 2. RLS activado, sin policies para 'authenticated':
--    SELECT relrowsecurity FROM pg_class WHERE relname = 'stripe_webhook_events';
--    SELECT * FROM pg_policies WHERE tablename = 'stripe_webhook_events';
--    La primera debe dar true; la segunda, cero filas.
