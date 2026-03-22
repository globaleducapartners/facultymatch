CREATE TABLE IF NOT EXISTS public.institution_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  institution_name TEXT NOT NULL,
  institution_type TEXT,
  country TEXT,
  city TEXT,
  website TEXT,
  cif TEXT,
  program_types TEXT[] DEFAULT '{}',
  knowledge_areas TEXT[] DEFAULT '{}',
  faculty_count TEXT,
  urgency TEXT,
  contact_name TEXT NOT NULL,
  contact_role TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  accepts_terms BOOLEAN DEFAULT FALSE,
  accepts_privacy BOOLEAN DEFAULT FALSE,
  accepts_marketing BOOLEAN DEFAULT FALSE,
  notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.institution_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_institution_applications"
  ON public.institution_applications
  FOR INSERT
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'general'
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

SELECT pg_notify('pgrst', 'reload schema');
