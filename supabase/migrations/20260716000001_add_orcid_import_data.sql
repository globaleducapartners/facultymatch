-- Add JSONB column to store imported ORCID/OpenAlex data
ALTER TABLE faculty_profiles
  ADD COLUMN IF NOT EXISTS orcid_import_data JSONB;