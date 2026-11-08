-- ============================================================================
-- Migración: eliminar las copias de seguridad antiguas con datos personales
-- Fecha: 2026-11-09
--
-- Contexto: durante las migraciones de julio-agosto de 2026 se dejaron en el
-- esquema public copias de faculty_profiles (5 tablas), de institutions y de las
-- solicitudes/leads antiguos. Siguen guardando datos personales de usuarios, y
-- los de las personas que después borran su cuenta NO se eliminan (la política
-- de privacidad promete que al eliminar la cuenta se borran los datos).
--
-- Comprobación previa (2026-11-09, comparando cada copia con los datos actuales):
--   · Ninguna copia tiene columnas que ya no existan en faculty_profiles: todo lo
--     que contienen (incluidas etiquetas/especialidades, ORCID y demás campos)
--     sigue existiendo en la tabla actual.
--   · Las únicas diferencias de contenido son campos de estado que cambiaron a
--     propósito con la consolidación (visibility, is_verified, estado_perfil,
--     profile_completeness, view_count) y ediciones puntuales de 1 usuario
--     (headline, bio, degrees, languages, years_experience, availability).
--   · Contienen filas de 4-5 personas que ya no tienen cuenta.
--   · Ninguna parte del código las lee.
--   · institutions_backup_* y _backup_20260802_* están vacías.
--
-- Es IRREVERSIBLE. No se tocan las tablas actuales. Se conserva
-- _backup_20261108_rls_policies (copia de reglas de seguridad, sin datos
-- personales) por si hubiera que deshacer la migración de seguridad; puede
-- eliminarse más adelante.
--
-- DROP TABLE sin CASCADE: si algo dependiera de alguna de estas tablas (vista,
-- clave foránea), falla y no se borra nada.
--
-- Aplicada en producción: PENDIENTE (anotar aquí la fecha cuando se aplique).
-- ============================================================================

BEGIN;

DROP TABLE IF EXISTS public.faculty_profiles_backup_20260705;
DROP TABLE IF EXISTS public.faculty_profiles_backup_20260718;
DROP TABLE IF EXISTS public.faculty_profiles_backup_20260718_b;
DROP TABLE IF EXISTS public.faculty_profiles_backup_20260719_revert;
DROP TABLE IF EXISTS public.faculty_profiles_backup_20260719_userid;
DROP TABLE IF EXISTS public.institutions_backup_20260719_userid;
DROP TABLE IF EXISTS public._backup_20260802_faculty_leads;
DROP TABLE IF EXISTS public._backup_20260802_institution_applications;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN — ejecutar APARTE, como segunda pasada.
-- ============================================================================
--
-- 1) No queda ninguna copia con datos personales. Esperado: solo
--    _backup_20261108_rls_policies
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name ILIKE '%backup%';
--
-- 2) Las tablas actuales siguen intactas. Esperado: los mismos números que tenías antes de borrar (anótalos antes)
-- SELECT (SELECT count(*) FROM public.faculty_profiles) AS perfiles_docente,
--        (SELECT count(*) FROM public.user_profiles)    AS perfiles_usuario;
