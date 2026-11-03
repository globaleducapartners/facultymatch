-- ============================================================================
-- Migración: enlace opcional en las notificaciones de la plataforma
-- Fecha: 2026-11-04
--
-- Motivo: las notificaciones que ve el docente en la campana y en su inicio
-- (tabla admin_notifications) solo tenían asunto y texto. Para poder enviar un
-- aviso como "Mejora tu perfil con IA" con un botón que abra directamente la
-- ventana de la IA, añadimos una columna `link` (ruta interna, p. ej.
-- /app/faculty/profile?ia=1).
--
-- Esta migración NO modifica datos existentes: solo añade una columna opcional
-- (NULL por defecto), así que no hace falta copia de seguridad ni backfill.
-- El código ya desplegado funciona sin ella (el aviso se enviaría sin botón) y
-- empieza a usar el enlace solo al aplicarla.
-- ============================================================================

BEGIN;

ALTER TABLE public.admin_notifications
  ADD COLUMN IF NOT EXISTS link text;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. La columna existe:
--    SELECT column_name, data_type, is_nullable
--    FROM information_schema.columns
--    WHERE table_schema = 'public' AND table_name = 'admin_notifications' AND column_name = 'link';
--    Debe devolver una fila: link | text | YES
--
-- 2. Las notificaciones existentes siguen intactas (link vacío):
--    SELECT count(*) AS total, count(link) AS con_enlace FROM public.admin_notifications;
--    Debe dar con_enlace = 0
