ALTER TABLE public.faculty_leads
  ADD COLUMN IF NOT EXISTS academic_level text,
  ADD COLUMN IF NOT EXISTS aneca_accreditation boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS aneca_number text,
  ADD COLUMN IF NOT EXISTS honorarium_range text,
  ADD COLUMN IF NOT EXISTS weekly_hours text,
  ADD COLUMN IF NOT EXISTS degree_types text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS past_institutions text[] DEFAULT '{}';

SELECT pg_notify('pgrst', 'reload schema');
