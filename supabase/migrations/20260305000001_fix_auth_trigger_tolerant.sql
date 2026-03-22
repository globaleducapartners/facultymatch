-- 3D.4: Fix handle_new_user trigger to be tolerant
-- - Use user_id column (not id) for faculty_profiles insert
-- - Add UNIQUE constraint on faculty_profiles.user_id
-- - Add INSERT policy on user_profiles (was missing)
-- - Wrap entire function in EXCEPTION block so signup never fails

ALTER TABLE public.faculty_profiles DROP CONSTRAINT IF EXISTS faculty_profiles_user_id_key;
ALTER TABLE public.faculty_profiles ADD CONSTRAINT faculty_profiles_user_id_key UNIQUE (user_id);

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
