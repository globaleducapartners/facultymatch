-- =============================================================================
-- FacultyMatch: Corrección — mismo agujero de permisos en increment_search_usage
-- Date: 2026-07-19
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  APLICAR EN EL SQL EDITOR                                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Al añadir el REVOKE/GRANT a increment_cv_extraction_usage (migración
-- 20260719000004), Miguel preguntó si increment_search_usage —el patrón que
-- copiamos, usado para el límite de 5 búsquedas/mes del plan Essential—
-- tiene el mismo agujero. No hay forma de comprobarlo desde el código (esa
-- función se creó a mano en el SQL Editor, no está en ninguna migración
-- versionada), pero por defecto PostgreSQL concede EXECUTE a PUBLIC en todo
-- CREATE FUNCTION, y no hay ningún REVOKE para ella en todo el repo — así
-- que lo más probable es que SÍ tenga el mismo agujero.
--
-- Impacto si lo tiene: cualquier institución autenticada podría llamar a la
-- RPC directamente (saltándose /app/institution/search) con el
-- p_institution_id de OTRA institución y quemarle su cupo mensual de
-- búsquedas — denegación de servicio, no fuga de datos (la función solo
-- incrementa un contador).
--
-- Este bloque resuelve la firma exacta de la función en tiempo de
-- ejecución (no la doy por supuesta) y aplica el mismo REVOKE/GRANT si la
-- función existe. Si no está expuesta a PUBLIC/anon/authenticated ahora
-- mismo, este bloque no cambia nada (es idempotente).
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_signature text;
BEGIN
  SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))
  INTO v_signature
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'increment_search_usage'
  LIMIT 1;

  IF v_signature IS NULL THEN
    RAISE NOTICE 'increment_search_usage no existe en public — nada que corregir aquí.';
  ELSE
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', v_signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', v_signature);
    RAISE NOTICE 'Permisos corregidos para %', v_signature;
  END IF;
END $$;

COMMIT;

-- =============================================================================
-- VERIFICACIONES (segunda pasada)
-- =============================================================================

-- 1. Firma real de la función (para confirmar qué se corrigió)
-- SELECT pg_get_function_identity_arguments(oid) FROM pg_proc WHERE proname = 'increment_search_usage';

-- 2. anon y authenticated NO deben poder ejecutarla; service_role sí
--    (sustituye <firma> por el resultado de la query 1, ej: uuid, text)
-- SELECT has_function_privilege('anon', 'public.increment_search_usage(<firma>)', 'EXECUTE') AS anon_puede,
--        has_function_privilege('authenticated', 'public.increment_search_usage(<firma>)', 'EXECUTE') AS authenticated_puede,
--        has_function_privilege('service_role', 'public.increment_search_usage(<firma>)', 'EXECUTE') AS service_role_puede;
-- Debe dar: false, false, true
