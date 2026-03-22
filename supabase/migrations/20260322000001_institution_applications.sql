CREATE TABLE IF NOT EXISTS institution_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  institution_name TEXT NOT NULL,
  institution_type TEXT,
  country TEXT,
  city TEXT,
  website TEXT,
  cif TEXT,
  program_types TEXT[],
  knowledge_areas TEXT[],
  faculty_count TEXT,
  urgency TEXT,
  contact_name TEXT NOT NULL,
  contact_role TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  accepts_terms BOOLEAN DEFAULT FALSE,
  accepts_privacy BOOLEAN DEFAULT FALSE,
  accepts_marketing BOOLEAN DEFAULT FALSE
);

-- Allow service role full access (API uses service role key)
ALTER TABLE institution_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON institution_applications
  FOR ALL USING (auth.role() = 'service_role');
