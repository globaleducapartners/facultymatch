-- ============================================================================
-- Migración: append_contact_follow_up — evita condición de carrera en follow_ups
-- Fecha: 2026-08-01
--
-- Motivo: tanto sendFollowUp (institución, src/app/app/institution/contacts/
-- actions.ts) como replyToContact (docente, src/app/auth/actions.ts) hacían
-- lectura del array JSONB `contacts.follow_ups` en el servidor, lo
-- modificaban en JS añadiendo el nuevo mensaje, y volvían a escribir el
-- array completo. Si dos mensajes se envían casi a la vez (doble clic, dos
-- pestañas abiertas) el segundo UPDATE sobrescribe el array leído antes del
-- primero, perdiendo ese mensaje silenciosamente.
--
-- Esta función hace el append con el operador `||` de jsonb dentro de un
-- único UPDATE, que Postgres ejecuta contra el valor vigente de la fila bajo
-- el lock de esa misma sentencia — no hay ventana entre leer y escribir.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.append_contact_follow_up(
  p_contact_id      uuid,
  p_follow_up       jsonb,
  p_status          text,
  p_reply_message   text DEFAULT NULL,
  p_set_replied_at  boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contacts
  SET follow_ups    = COALESCE(follow_ups, '[]'::jsonb) || p_follow_up,
      status        = p_status,
      reply_message = COALESCE(p_reply_message, reply_message),
      replied_at    = CASE WHEN p_set_replied_at THEN now() ELSE replied_at END
  WHERE id = p_contact_id;
END;
$$;

-- Mismo patrón que las demás RPC de escritura sensible: solo el service role
-- (usado desde el servidor tras verificar que el llamante es dueño del
-- contacto) puede ejecutarla.
REVOKE EXECUTE ON FUNCTION public.append_contact_follow_up(uuid, jsonb, text, text, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.append_contact_follow_up(uuid, jsonb, text, text, boolean)
  TO service_role;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar por separado, en una segunda pasada)
-- ============================================================================
-- 1. La función existe con la firma esperada:
--    SELECT pg_get_function_identity_arguments(oid) FROM pg_proc WHERE proname = 'append_contact_follow_up';
--
-- 2. anon y authenticated NO deben poder ejecutarla; service_role sí:
--    SELECT has_function_privilege('anon', 'public.append_contact_follow_up(uuid,jsonb,text,text,boolean)', 'EXECUTE') AS anon_puede,
--           has_function_privilege('authenticated', 'public.append_contact_follow_up(uuid,jsonb,text,text,boolean)', 'EXECUTE') AS authenticated_puede,
--           has_function_privilege('service_role', 'public.append_contact_follow_up(uuid,jsonb,text,text,boolean)', 'EXECUTE') AS service_role_puede;
--    Debe dar: false, false, true
