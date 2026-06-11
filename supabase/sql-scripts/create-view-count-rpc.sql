-- ============================================================
-- FacultyMatch: Create view_count RPC function & backfill data
-- Execute this in your Supabase Dashboard SQL Editor
-- ============================================================

-- 1. Ensure view_count column exists (idempotent)
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Create atomic increment RPC function
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

-- 3. Backfill view_count from existing contacts (engagement history)
UPDATE public.faculty_profiles fp
SET view_count = (
  SELECT COUNT(*) FROM public.contacts c
  WHERE c.faculty_id = fp.id
)
WHERE view_count IS NULL OR view_count = 0;

SELECT '✅ Migration completed successfully' AS status;