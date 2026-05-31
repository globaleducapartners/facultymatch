-- Migration: domain blocking + profile banner
-- 2026-06-01

-- 1. Add domain column to visibility_rules
--    Stores the email domain of a blocked institution (e.g. "ucm.es")
--    so that ANY user whose email ends in @domain gets blocked too.
ALTER TABLE visibility_rules
  ADD COLUMN IF NOT EXISTS domain TEXT;

CREATE INDEX IF NOT EXISTS visibility_rules_domain_idx
  ON visibility_rules (domain)
  WHERE domain IS NOT NULL;

-- 2. Add banner_url column to faculty_profiles
--    Stores a custom banner image URL (upload or preset).
ALTER TABLE faculty_profiles
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 3. Create the banners storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Allow authenticated users to manage their own banner files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can upload their own banner'
  ) THEN
    CREATE POLICY "Users can upload their own banner"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can update their own banner'
  ) THEN
    CREATE POLICY "Users can update their own banner"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public banner read'
  ) THEN
    CREATE POLICY "Public banner read"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'banners');
  END IF;
END $$;
