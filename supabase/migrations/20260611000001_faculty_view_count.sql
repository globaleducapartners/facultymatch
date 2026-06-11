-- Migration: Add view_count column + atomic increment function + storage bucket policies
-- 2026-06-11 (updated)

-- ═══════════════════════════════════════════════════════════════
-- 1. view_count column & RPC
-- ═══════════════════════════════════════════════════════════════

-- 1a. Add view_count column to faculty_profiles (idempotent)
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 1b. Create atomic increment function for safe concurrent updates
CREATE OR REPLACE FUNCTION public.increment_faculty_view_count(p_faculty_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.faculty_profiles
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_faculty_id;
END;
$$;

-- 1c. Backfill view_count from contacts table (count each contact as a view)
UPDATE public.faculty_profiles fp
SET view_count = (
  SELECT COUNT(*) FROM public.contacts c
  WHERE c.faculty_id = fp.id
)
WHERE view_count IS NULL OR view_count = 0;

-- ═══════════════════════════════════════════════════════════════
-- 2. Storage bucket: faculty_documents (make public for link access)
-- ═══════════════════════════════════════════════════════════════

-- 2a. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('faculty_documents', 'faculty_documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2b. Allow authenticated users to upload/manage their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Faculty can upload their own documents'
  ) THEN
    CREATE POLICY "Faculty can upload their own documents"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'faculty_documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Faculty can update their own documents'
  ) THEN
    CREATE POLICY "Faculty can update their own documents"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'faculty_documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Faculty can delete their own documents'
  ) THEN
    CREATE POLICY "Faculty can delete their own documents"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'faculty_documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public faculty document read'
  ) THEN
    CREATE POLICY "Public faculty document read"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'faculty_documents');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 3. Storage bucket: avatars (ensure public read access)
-- ═══════════════════════════════════════════════════════════════

-- 3a. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public avatar read'
  ) THEN
    CREATE POLICY "Public avatar read"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'avatars');
  END IF;
END $$;

SELECT '✅ Full migration completed successfully' AS status;