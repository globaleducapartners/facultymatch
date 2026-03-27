-- Backfill user_id = id for faculty_profiles rows created with old triggers
-- These rows have user_id NULL because old handle_new_user() only inserted id
UPDATE public.faculty_profiles
SET user_id = id
WHERE user_id IS NULL;

-- Add preferred_institutions for the premium "preferred visibility" feature
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS preferred_institutions text[] DEFAULT '{}';

SELECT pg_notify('pgrst', 'reload schema');
