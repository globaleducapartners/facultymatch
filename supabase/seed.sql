-- ====================================================================================
-- REQUERIDO: Este script de SQL NO crea usuarios en el sistema de Autenticación.
-- Se recomienda usar el script de automatización: `npm run seed` (scripts/seed.ts)
-- que utiliza la Admin API para crear tanto los usuarios como sus perfiles reales.
-- ====================================================================================

begin;

-- 1. Limpieza (opcional para desarrollo)
-- truncate public.faculty_expertise cascade;
-- truncate public.faculty_profiles cascade;
-- truncate public.institutions cascade;
-- truncate public.user_profiles cascade;

-- NOTA: Si vas a usar este script manualmente, debes reemplazar los UUIDs
-- con IDs reales de tu tabla auth.users.

commit;
