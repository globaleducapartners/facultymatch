ALTER TABLE faculty_profiles
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS career_type text,
  ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_position text,
  ADD COLUMN IF NOT EXISTS current_company text,
  ADD COLUMN IF NOT EXISTS industry_sector text,
  ADD COLUMN IF NOT EXISTS career_description text;