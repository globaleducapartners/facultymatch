-- Migration: limitación de frecuencia (rate limit) para formularios públicos
-- 2026-09-28
--
-- Tabla nueva + función atómica check_rate_limit(). Se usa desde el
-- servidor (signup y newsletter) con la clave = hash del IP, para frenar
-- automatización aunque el bot ignore el campo señuelo (honeypot).
--
-- Solo crea objetos nuevos: no toca filas existentes, no necesita backup
-- ni backfill. RLS activado sin políticas: solo el service_role (servidor)
-- puede leer/escribir. Si esta migración aún no está aplicada, el código
-- de la app "falla abierto" (no bloquea a nadie), así que se puede
-- desplegar antes o después sin romper el alta.
--
-- Estado: PENDIENTE de aplicar (pegar en el SQL Editor de Supabase).

BEGIN;

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text        NOT NULL,
  window_start timestamptz NOT NULL,
  count        integer     NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_count  integer;
BEGIN
  v_window := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  -- Limpieza ocasional de ventanas antiguas (~2% de las llamadas)
  IF random() < 0.02 THEN
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN v_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

COMMIT;

-- ─── VERIFICACIÓN (ejecutar como SEGUNDA pasada, aparte) ───────────────
-- SELECT public.check_rate_limit('test', 2, 60);  -- true
-- SELECT public.check_rate_limit('test', 2, 60);  -- true
-- SELECT public.check_rate_limit('test', 2, 60);  -- false
-- DELETE FROM public.rate_limits WHERE key = 'test';
