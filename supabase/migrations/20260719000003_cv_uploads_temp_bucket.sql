-- =============================================================================
-- FacultyMatch: Bucket privado para CVs subidos en el flujo de onboarding con IA
-- Date: 2026-07-19
--
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  APLICAR EN EL SQL EDITOR                                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Fase 1 de "Vía IA del onboarding" (ver CLAUDE.md). El CV se sube directo
-- del navegador a este bucket (evita el límite de payload de las funciones
-- serverless de Vercel), y el endpoint /api/onboarding/extract-cv solo recibe
-- la ruta del archivo, lo descarga con el service role, extrae el texto y
-- borra el archivo. A diferencia de `faculty_documents` (público), este
-- bucket es privado: un CV contiene datos personales y la pantalla de
-- onboarding promete "tu CV solo se usa para rellenar tu perfil".
--
-- Convención de rutas: {auth.uid()}/{nombre-random}.{pdf|docx} — las policies
-- de abajo usan el primer segmento de la ruta para restringir cada usuario a
-- su propia carpeta.
-- =============================================================================

BEGIN;

-- 1. Bucket privado, con límite de tamaño y tipos MIME reforzado también a
--    nivel de Storage (además de la validación en el cliente y el servidor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-uploads-temp',
  'cv-uploads-temp',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- 2. RLS en storage.objects, solo para este bucket
--    (RLS ya está activado en storage.objects a nivel de proyecto)

DROP POLICY IF EXISTS "cv_uploads_temp_insert_own" ON storage.objects;
CREATE POLICY "cv_uploads_temp_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cv-uploads-temp'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "cv_uploads_temp_delete_own" ON storage.objects;
CREATE POLICY "cv_uploads_temp_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cv-uploads-temp'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Deliberadamente SIN policy de SELECT para 'authenticated': el propio
-- docente no necesita leer el archivo de vuelta, y así nadie salvo el
-- service role (que ignora RLS) puede descargar el CV. Tampoco hay policy
-- de UPDATE: los archivos de este bucket son de un solo uso.

COMMIT;

-- =============================================================================
-- VERIFICACIONES (segunda pasada)
-- =============================================================================

-- 1. El bucket debe existir, ser privado y tener el límite de 10MB
-- SELECT id, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets WHERE id = 'cv-uploads-temp';

-- 2. Deben existir exactamente las 2 policies (insert + delete), ninguna de select
-- SELECT policyname, cmd FROM pg_policies
-- WHERE tablename = 'objects' AND policyname LIKE 'cv_uploads_temp%'
-- ORDER BY policyname;
