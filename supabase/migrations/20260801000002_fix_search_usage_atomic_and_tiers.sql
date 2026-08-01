-- ============================================================================
-- Migración: increment_search_usage atómica + parametrizable por plan
-- Fecha: 2026-08-01
--
-- Motivo: increment_search_usage se creó a mano en el SQL Editor (no está en
-- ninguna migración versionada — igual que pasó con exec_sql). El código de
-- aplicación hacía su propio SELECT del contador, decidía si bloquear, y solo
-- LUEGO llamaba a la RPC sin mirar su resultado — es decir, la propia RPC
-- podía ser perfectamente atómica y aun así el bug de carrera existía en la
-- capa de aplicación, porque nunca se apoyó en ella.
--
-- Este archivo sustituye la función por una versión con el mismo patrón
-- FOR UPDATE que ya usa increment_cv_extraction_usage (20260719000004), y le
-- añade un parámetro p_monthly_limit para poder aplicar límites distintos
-- por plan (Essential: 5, Growth: 20) con la misma función — antes el "5"
-- estaba hardcodeado en el código de la aplicación, no en la función.
--
-- Se hace CREATE OR REPLACE con la firma NUEVA (3 parámetros). Si la función
-- vieja tenía 2 parámetros, quedaría como una firma distinta y duplicada, así
-- que se elimina primero cualquier versión previa de 2 parámetros.
-- ============================================================================

BEGIN;

-- Asegura que la tabla existe con la forma que ya asume el código de
-- aplicación (institution_id, month, search_count), y añade la restricción
-- única que la función necesita para el UPSERT + FOR UPDATE.
CREATE TABLE IF NOT EXISTS public.search_usage (
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  month          text NOT NULL,
  search_count   integer NOT NULL DEFAULT 0,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (institution_id, month)
);

ALTER TABLE public.search_usage ENABLE ROW LEVEL SECURITY;
-- Sin policies para 'authenticated': solo el service role (bypassa RLS)
-- desde /app/institution/search debe leer/escribir esta tabla.

-- Elimina cualquier versión previa de 2 parámetros (la creada a mano),
-- para no dejar dos funciones con el mismo nombre y distinta firma.
DROP FUNCTION IF EXISTS public.increment_search_usage(uuid, text);

CREATE OR REPLACE FUNCTION public.increment_search_usage(
  p_institution_id uuid,
  p_month          text,
  p_monthly_limit  integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.search_usage (institution_id, month, search_count)
  VALUES (p_institution_id, p_month, 0)
  ON CONFLICT (institution_id, month) DO NOTHING;

  SELECT search_count INTO v_count
  FROM public.search_usage
  WHERE institution_id = p_institution_id AND month = p_month
  FOR UPDATE;

  IF v_count >= p_monthly_limit THEN
    RETURN false;
  END IF;

  UPDATE public.search_usage
  SET search_count = search_count + 1,
      updated_at = now()
  WHERE institution_id = p_institution_id AND month = p_month;

  RETURN true;
END;
$$;

-- Mismo agujero que ya corregimos en increment_cv_extraction_usage: sin este
-- REVOKE, cualquier institución autenticada podría llamar a la RPC con el
-- p_institution_id de OTRA institución y quemarle su cupo del mes.
REVOKE EXECUTE ON FUNCTION public.increment_search_usage(uuid, text, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_search_usage(uuid, text, integer)
  TO service_role;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. Solo debe existir la firma de 3 parámetros:
--    SELECT pg_get_function_identity_arguments(oid) FROM pg_proc WHERE proname = 'increment_search_usage';
--
-- 2. anon y authenticated NO deben poder ejecutarla; service_role sí:
--    SELECT has_function_privilege('anon', 'public.increment_search_usage(uuid,text,integer)', 'EXECUTE') AS anon_puede,
--           has_function_privilege('authenticated', 'public.increment_search_usage(uuid,text,integer)', 'EXECUTE') AS authenticated_puede,
--           has_function_privilege('service_role', 'public.increment_search_usage(uuid,text,integer)', 'EXECUTE') AS service_role_puede;
--    Debe dar: false, false, true
--
-- 3. Prueba manual: debe dar true, true, true, false, false para 5 llamadas
--    seguidas con un institution_id de prueba y límite 3
--    (sustituye el uuid por uno real):
--    SELECT increment_search_usage('00000000-0000-0000-0000-000000000000', to_char(now(),'YYYY-MM'), 3);
