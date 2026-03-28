-- Tabla de leads de docentes (formulario /apply previo al registro)
-- Estructura basada en el schema real de producción (confirmado 2026-03-28)

CREATE TABLE IF NOT EXISTS public.faculty_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  city TEXT,
  languages TEXT[] DEFAULT '{}',
  primary_fields TEXT[] DEFAULT '{}',
  subjects TEXT[] DEFAULT '{}',
  degrees TEXT[] DEFAULT '{}',
  current_institution TEXT,
  is_currently_teaching BOOLEAN DEFAULT false,
  institutions_taught TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  linkedin_url TEXT,
  bio TEXT,
  modalities TEXT[] DEFAULT '{}',
  availability TEXT,
  consent_terms BOOLEAN DEFAULT false,
  consent_terms_at TIMESTAMPTZ,
  consent_privacy BOOLEAN DEFAULT false,
  consent_privacy_at TIMESTAMPTZ,
  academic_level TEXT,
  aneca_accreditation BOOLEAN DEFAULT false,
  aneca_number TEXT,
  honorarium_range TEXT,
  weekly_hours TEXT,
  degree_types TEXT[] DEFAULT '{}',
  past_institutions TEXT[] DEFAULT '{}'
);

ALTER TABLE public.faculty_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_faculty_leads"
  ON public.faculty_leads FOR INSERT WITH CHECK (true);

SELECT pg_notify('pgrst', 'reload schema');