/**
 * Plan de prueba E2E — Ciclo completo de verificación
 *
 * Escenario: Admin verifica y rechaza un perfil de prueba desde el panel.
 * Requiere servidor dev corriendo (bun run dev) y acceso a Supabase.
 *
 * Uso:
 *   1. Crear usuario de prueba manualmente o con bun run scripts/test-crear-faculty.ts
 *   2. Seguir pasos 1-8 desde el navegador y terminal
 *   3. Ejecutar bun run scripts/test-verificar-rechazar.ts para la parte automatizada
 *
 * =============================================================================
 * PRERREQUISITOS
 * =============================================================================
 * - Admin logueado en /control (email: admin@facultymatch.app)
 * - Un faculty de prueba con onboarding completado y estado_perfil = 'en_revision'
 * - Variables de entorno en .env.local (NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY)
 *
 * =============================================================================
 * PASO 1: Crear faculty de prueba
 * =============================================================================
 *
 * 1. Registra un nuevo usuario faculty en /auth/register
 * 2. Completa el onboarding wizard al 100%
 * 3. Publica el perfil (publishProfile → estado_perfil = 'en_revision')
 * 4. Confirma que en el panel /control aparece en "Verificación docentes"
 *
 * ✅ Verificación visual:
 *    - Sidebar: badge naranja con el contador de pendientes incrementado
 *    - /control: tarjeta del nuevo perfil en la columna "Pendientes"
 *    - Estado: "En revisión" (badge ámbar)
 *
 * =============================================================================
 * PASO 2: Verificar perfil desde el panel
 * =============================================================================
 *
 * 1. En /control haz clic en el perfil pendiente → /control/faculty/{id}
 * 2. Revisa la información del perfil (datos personales, académicos, documentos)
 * 3. En la Action Bar, haz clic en "Activar / Verificar"
 * 4. Espera el mensaje de confirmación "Acción completada correctamente"
 *
 * ✅ Verificación:
 *    - Badge cambia a "Verificado" (verde)
 *    - Estado en la tarjeta de información: "Verificado el {fecha}"
 *    - Sección "Verificado por" muestra el UUID del admin
 *    - El faculty recibe email de confirmación
 *    - BD: faculty_profiles.estado_perfil = 'verificado'
 *    - BD: faculty_profiles.is_verified = true
 *    - BD: faculty_profiles.verificado_por = admin UUID
 *    - BD: faculty_profiles.verificado_en = timestamp
 *
 * =============================================================================
 * PASO 3: Verificar visibilidad en directorio público
 * =============================================================================
 *
 * 1. Abre una ventana de incógnito (sin sesión activa)
 * 2. Navega a /docentes/{slug} del perfil recién verificado
 * 3. Confirma que el perfil es visible con todos los datos
 *
 * ✅ Verificación:
 *    - El perfil carga correctamente
 *    - Se muestra el badge "Verificado"
 *    - El slug se generó automáticamente (profile_slug no es null)
 *
 * =============================================================================
 * PASO 4: Descargar PDF del perfil verificado
 * =============================================================================
 *
 * 1. Logueate como el faculty de prueba
 * 2. Navega a /app/faculty/profile
 * 3. Busca el botón "Descargar PDF" (enlace a /api/perfil-pdf)
 * 4. Haz clic y confirma que se descarga un PDF con los datos del perfil
 *
 * ✅ Verificación:
 *    - Se descarga un archivo .pdf
 *    - El PDF contiene: nombre, headline, bio, grados, áreas, etc.
 *    - El nombre del archivo es: perfil-verificado-facultymatch-{nombre}.pdf
 *
 * =============================================================================
 * PASO 5: Re-verificación por cambio de campo sensible
 * =============================================================================
 *
 * 1. Logueate como el faculty de prueba
 * 2. Navega a /app/faculty/profile → pestaña "Formación"
 * 3. Edita un título académico (campo sensible: "degrees")
 * 4. Guarda los cambios
 * 5. Vuelve al panel de admin /control
 *
 * ✅ Verificación:
 *    - El perfil aparece de nuevo en "Verificación docentes"
 *    - Badge: "En revisión" (ámbar)
 *    - BD: faculty_profiles.estado_perfil = 'en_revision'
 *    - BD: faculty_profiles.is_verified = false
 *    - BD: faculty_profiles.verificado_por = null
 *    - El directorio público ya NO muestra el perfil
 *
 * Prueba negativa: cambiar un campo NO sensible (ej. bio, disponibilidad, idiomas, linkedin_url, website, foto)
 *    - estado_perfil debe permanecer = 'verificado'
 *    - is_verified debe permanecer = true
 *
 * =============================================================================
 * PASO 6: Rechazar perfil desde el panel
 * =============================================================================
 *
 * 1. En /control/{id} del perfil en revisión
 * 2. Haz clic en "Revocar verificación"
 * 3. Confirma mensaje de éxito
 *
 * ✅ Verificación:
 *    - Badge cambia a "Rechazado" (rojo)
 *    - BD: faculty_profiles.estado_perfil = 'rechazado'
 *    - BD: faculty_profiles.is_verified = false
 *    - El faculty puede ver el banner rojo en /app/faculty
 *    - El directorio público NO muestra el perfil
 *
 * =============================================================================
 * PASO 7: Reactivar perfil rechazado
 * =============================================================================
 *
 * 1. En /control/{id} del perfil rechazado
 * 2. Haz clic en "Activar / Verificar"
 *
 * ✅ Verificación:
 *    - Badge cambia a "Verificado"
 *    - BD: estado_perfil = 'verificado', is_verified = true
 *    - El perfil vuelve a ser visible en el directorio público
 *
 * =============================================================================
 * PASO 8: Limpiar
 * =============================================================================
 *
 * 1. En /control/faculty/{id} haz clic en "Eliminar cuenta"
 * 2. Confirma en el diálogo
 *
 * ✅ Verificación:
 *    - Redirige a /control/faculty
 *    - El usuario ya no aparece en la lista
 *    - BD: el usuario fue eliminado (cascade)
 *
 * =============================================================================
 * VERIFICACIONES EN BD (ejecutar contra Supabase)
 * =============================================================================
 *
 * -- 1. Contar perfiles por estado
 * SELECT estado_perfil, count(*) FROM faculty_profiles GROUP BY 1 ORDER BY 1;
 *
 * -- 2. Verificar que verificado == is_verified
 * SELECT count(*) FROM faculty_profiles
 * WHERE estado_perfil = 'verificado' AND is_verified = false;
 * -- Debe devolver 0
 *
 * SELECT count(*) FROM faculty_profiles
 * WHERE estado_perfil != 'verificado' AND is_verified = true;
 * -- Debe devolver 0
 *
 * -- 3. Verificar auditoría completa
 * SELECT fp.user_id, up.full_name, fp.estado_perfil, fp.is_verified,
 *        fp.verificado_por, fp.verificado_en, fp.verification_notes
 * FROM faculty_profiles fp
 * JOIN user_profiles up ON up.id = fp.user_id
 * WHERE fp.estado_perfil = 'verificado'
 * ORDER BY fp.verificado_en DESC;
 * -- Cada fila debe tener verificado_por y verificado_en no nulos
 *
 * -- 4. Verificar slugs generados
 * SELECT count(*) FROM faculty_profiles
 * WHERE profile_slug IS NULL AND estado_perfil = 'verificado';
 * -- Debe devolver 0
 *
 * -- 5. Verificar que no hay huérfanos
 * SELECT count(*) FROM faculty_profiles fp
 * WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = fp.user_id);
 * -- Debe devolver 0
 */