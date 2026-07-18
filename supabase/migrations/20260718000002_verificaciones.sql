-- =============================================================================
-- FacultyMatch: Verificaciones post-migración
-- Date: 2026-07-18
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SEGUNDA PASADA — ejecutar DESPUÉS de la migración (Pasos 1-6)         ║
-- ║  en el Supabase SQL Editor.                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- No incluye BEGIN/COMMIT. Son solo SELECTs de verificación.
-- El SQL Editor muestra el último resultado, por eso se ejecuta aparte.
-- =============================================================================

-- ═════════════════════════════════════════════════════════════════════════════
-- 7. VERIFICACIÓN — todas deben devolver 0 filas o los valores esperados
-- ═════════════════════════════════════════════════════════════════════════════

-- 7a. Approved con onboarding completado pero sin estado_perfil='verificado'
SELECT 'ERROR: approved+completed sin estado_perfil=verificado' AS check_name,
       count(*) AS rows
FROM public.faculty_profiles fp
JOIN public.user_profiles up ON up.id = fp.user_id
WHERE up.role = 'faculty'
  AND up.verification_status = 'approved'
  AND fp.onboarding_status = 'completed'
  AND fp.estado_perfil != 'verificado';

-- 7b. Approved sin onboarding completado pero con estado_perfil='verificado'
SELECT 'ERROR: approved+incomplete con estado_perfil=verificado' AS check_name,
       count(*) AS rows
FROM public.faculty_profiles fp
JOIN public.user_profiles up ON up.id = fp.user_id
WHERE up.role = 'faculty'
  AND up.verification_status = 'approved'
  AND fp.onboarding_status != 'completed'
  AND fp.estado_perfil = 'verificado';

-- 7c. No debe haber faculty_profiles sin user_profiles asociado
SELECT 'ERROR: faculty_profiles huérfanos' AS check_name, count(*) AS rows
FROM public.faculty_profiles fp
WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = fp.user_id);

-- 7d. No debe haber user_profiles (faculty) sin faculty_profiles
SELECT 'ERROR: user_profiles sin faculty_profiles' AS check_name, count(*) AS rows
FROM public.user_profiles up
WHERE up.role = 'faculty'
  AND NOT EXISTS (SELECT 1 FROM public.faculty_profiles fp WHERE fp.user_id = up.id);

-- 7e. Check decisivo: estado_perfil='verificado' debe dar exactamente 7
--     (6 que ya existían con onboarding completado + 1 insertado: Laura Matilla)
SELECT 'CHECK: perfiles con estado_perfil=verificado (debe ser 7)' AS check_name,
       count(*) AS rows
FROM public.faculty_profiles
WHERE estado_perfil = 'verificado';

-- 7f. Check decisivo: is_verified=true debe dar exactamente 7
SELECT 'CHECK: perfiles con is_verified=true (debe ser 7)' AS check_name,
       count(*) AS rows
FROM public.faculty_profiles
WHERE is_verified = true;

-- 7g. Resumen completo de estado_perfil
SELECT 'RESUMEN: estado_perfil distribution' AS check_name,
       fp.estado_perfil, count(*) AS count
FROM public.faculty_profiles fp
GROUP BY fp.estado_perfil
ORDER BY fp.estado_perfil;