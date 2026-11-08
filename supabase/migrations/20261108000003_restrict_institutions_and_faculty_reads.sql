-- ============================================================================
-- Migración: cerrar lecturas indebidas de instituciones y perfiles de docentes
-- Fecha: 2026-11-08
--
-- Problema (comprobado con la clave pública y con sesiones de prueba):
--   1) institutions: la regla "Institutions viewable by everyone" (migración
--      inicial) dejaba leer TODAS las instituciones a cualquiera con la clave
--      pública del proyecto, incluidos contact_email, phone, cif y los motivos
--      internos de rechazo (rejection_reason, rejected_at).
--   2) faculty_profiles: cualquier usuario con sesión (incluso un docente con
--      cuenta gratuita) podía leer, llamando a la API con su propia sesión, los
--      perfiles de TODOS los docentes públicos con campos sensibles: phone,
--      profile_token, referral_stats, verification_notes, verificado_por,
--      orcid_import_data. La web oculta el teléfono a las instituciones sin plan
--      Professional, pero esa protección se saltaba leyendo directamente la base.
--
-- Qué hace:
--   · institutions: quita todo permiso de lectura a anon y deja a authenticated
--     leer SOLO columnas no sensibles (nombre, país, ciudad, tipo, logo, web...).
--     Las filas siguen siendo visibles (los docentes ven el nombre de las
--     instituciones que les contactan y el selector de instituciones funciona),
--     pero contact_email, phone, cif, rejection_reason, rejected_at y las
--     coordenadas ya no se pueden leer con una sesión de usuario. El servidor
--     (service_role), que es el que usa la web para esos datos, no cambia.
--   · faculty_profiles: elimina las reglas de lectura que dejaban ver filas
--     ajenas y deja una única: cada usuario lee su propia fila. Todo lo que
--     muestra datos de otros docentes (buscador, fichas, directorio, páginas
--     públicas) ya usa el cliente de servidor y no se ve afectado.
--
-- Antes de aplicarla hay que tener desplegado el código del commit que
-- acompaña a esta migración (dos consultas pasan al cliente de servidor).
--
-- No modifica ningún dato: solo permisos y reglas. Se guarda una copia de las
-- reglas actuales en _backup_20261108_rls_policies (RLS activado, sin datos
-- personales) para poder restaurarlas.
--
-- DESHACER (si algo falla tras aplicarla), en el SQL Editor:
--   GRANT SELECT ON public.institutions TO anon, authenticated;
--   -- y para faculty_profiles, volver a crear la regla de lectura general que
--   -- figura en la tabla _backup_20261108_rls_policies (columnas policyname, qual):
--   -- SELECT policyname, cmd, roles, qual FROM public._backup_20261108_rls_policies
--   --   WHERE tablename = 'faculty_profiles';
--
-- Aplicada en producción: PENDIENTE (anotar aquí la fecha cuando se aplique).
-- ============================================================================

BEGIN;

SET LOCAL search_path = public;

-- ── 0. Copia de las reglas de seguridad actuales ───────────────────────────
CREATE TABLE IF NOT EXISTS public._backup_20261108_rls_policies AS
  SELECT now() AS saved_at, p.*
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename IN ('institutions', 'faculty_profiles');

ALTER TABLE public._backup_20261108_rls_policies ENABLE ROW LEVEL SECURITY;

-- ── 1. institutions: solo columnas no sensibles, y solo con sesión ─────────
REVOKE SELECT ON public.institutions FROM PUBLIC;
REVOKE SELECT ON public.institutions FROM anon;
REVOKE SELECT ON public.institutions FROM authenticated;

GRANT SELECT (
  id, user_id, name, type, institution_type, country, city, location,
  website, description, logo_url, banner_url, linkedin_url,
  founded_year, num_students, modality, faculty_department,
  status, verified, verified_at, university_id, created_at, updated_at
) ON public.institutions TO authenticated;

-- ── 2. faculty_profiles: cada usuario lee solo su propia fila ──────────────
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'faculty_profiles'
      AND cmd = 'SELECT' AND policyname <> 'faculty_profiles_select_own'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.faculty_profiles', pol.policyname);
  END LOOP;
END $$;

DROP POLICY IF EXISTS faculty_profiles_select_own ON public.faculty_profiles;
CREATE POLICY faculty_profiles_select_own ON public.faculty_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

-- Que la API vea los cambios de permisos sin esperar.
SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN — ejecutar APARTE, como segunda pasada (cada bloque por separado).
-- ============================================================================
--
-- 1) Permisos de columnas de institutions. Esperado: false | false | true
-- SELECT has_column_privilege('anon',          'public.institutions', 'contact_email', 'SELECT') AS anon_lee_email,
--        has_column_privilege('authenticated', 'public.institutions', 'contact_email', 'SELECT') AS usuario_lee_email,
--        has_column_privilege('authenticated', 'public.institutions', 'name',          'SELECT') AS usuario_lee_nombre;
--
-- 2) anon no tiene ninguna columna legible de institutions. Esperado: 0
-- SELECT count(*) FROM information_schema.column_privileges
-- WHERE table_schema = 'public' AND table_name = 'institutions'
--   AND grantee = 'anon' AND privilege_type = 'SELECT';
--
-- 3) Reglas que quedan en faculty_profiles. Esperado: la de «manage own» (ALL)
--    y faculty_profiles_select_own (SELECT); ninguna otra de lectura abierta.
-- SELECT policyname, cmd, roles, qual
-- FROM pg_policies WHERE schemaname = 'public' AND tablename = 'faculty_profiles' ORDER BY policyname;
--
-- 4) La copia de reglas anteriores se guardó. Esperado: un número > 0
-- SELECT count(*) FROM public._backup_20261108_rls_policies;
