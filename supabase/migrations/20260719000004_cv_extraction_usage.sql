-- =============================================================================
-- FacultyMatch: Rate limit de extracción de CV con IA (3/usuario/día)
-- Date: 2026-07-19
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  APLICAR EN EL SQL EDITOR                                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Mismo patrón que search_usage / increment_search_usage (límite de
-- búsquedas del plan Essential), pero atado a user_id (no a institution_id
-- ni a IP) y por día en vez de por mes, y con el check-and-increment
-- resuelto de forma atómica dentro de la función (FOR UPDATE) porque aquí
-- sí importa que dos llamadas simultáneas no se cuelen ambas.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.cv_extraction_usage (
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day              date NOT NULL,
  extraction_count integer NOT NULL DEFAULT 0,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.cv_extraction_usage ENABLE ROW LEVEL SECURITY;

-- Sin policies para 'authenticated': esta tabla solo la lee/escribe el
-- service role (bypassa RLS) desde el endpoint de extracción.

CREATE OR REPLACE FUNCTION public.increment_cv_extraction_usage(
  p_user_id     uuid,
  p_day         date,
  p_daily_limit integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.cv_extraction_usage (user_id, day, extraction_count)
  VALUES (p_user_id, p_day, 0)
  ON CONFLICT (user_id, day) DO NOTHING;

  SELECT extraction_count INTO v_count
  FROM public.cv_extraction_usage
  WHERE user_id = p_user_id AND day = p_day
  FOR UPDATE;

  IF v_count >= p_daily_limit THEN
    RETURN false;
  END IF;

  UPDATE public.cv_extraction_usage
  SET extraction_count = extraction_count + 1,
      updated_at = now()
  WHERE user_id = p_user_id AND day = p_day;

  RETURN true;
END;
$$;

-- SECURITY DEFINER + PostgreSQL concede EXECUTE a PUBLIC por defecto en el
-- CREATE FUNCTION de arriba. Sin este REVOKE, cualquier usuario autenticado
-- podría llamar a la RPC directamente (bypaseando el endpoint) con el
-- p_user_id de OTRO docente y quemarle sus 3 intentos diarios. Solo el
-- service_role (que ya usa el endpoint) debe poder ejecutarla.
REVOKE EXECUTE ON FUNCTION public.increment_cv_extraction_usage(uuid, date, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_cv_extraction_usage(uuid, date, integer)
  TO service_role;

COMMIT;

-- =============================================================================
-- VERIFICACIONES (segunda pasada)
-- =============================================================================

-- 1. La función debe existir
-- SELECT proname FROM pg_proc WHERE proname = 'increment_cv_extraction_usage';

-- 1b. anon y authenticated NO deben poder ejecutarla; service_role sí
-- SELECT has_function_privilege('anon', 'public.increment_cv_extraction_usage(uuid,date,integer)', 'EXECUTE') AS anon_puede,
--        has_function_privilege('authenticated', 'public.increment_cv_extraction_usage(uuid,date,integer)', 'EXECUTE') AS authenticated_puede,
--        has_function_privilege('service_role', 'public.increment_cv_extraction_usage(uuid,date,integer)', 'EXECUTE') AS service_role_puede;
-- Debe dar: false, false, true

-- 2. Prueba manual: debe dar true, true, true, false para 4 llamadas seguidas
--    con el mismo usuario y día (sustituye el uuid por uno real de prueba)
-- SELECT increment_cv_extraction_usage('00000000-0000-0000-0000-000000000000', current_date, 3);
