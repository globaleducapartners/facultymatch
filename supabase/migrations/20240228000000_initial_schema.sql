
-- ETAPA 0 (OBLIGATORIA) — SUPABASE DB + RLS
-- Initial setup for Faculty Finder

-- Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('faculty', 'institution', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.visibility_mode AS ENUM ('public', 'private', 'hidden');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.rule_type AS ENUM ('block', 'allow');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'faculty',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. faculty_profiles
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    current_institution TEXT,
    location TEXT,
    years_experience INTEGER,
    visibility public.visibility_mode DEFAULT 'public',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. faculty_expertise
CREATE TABLE IF NOT EXISTS public.faculty_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    area TEXT NOT NULL,
    level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. faculty_documents
CREATE TABLE IF NOT EXISTS public.faculty_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    doc_type TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    location TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. visibility_rules
CREATE TABLE IF NOT EXISTS public.visibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    rule public.rule_type NOT NULL DEFAULT 'allow',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(faculty_id, institution_id)
);

-- 7. favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(institution_id, faculty_id)
);

-- 8. contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'rejected')),
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- user_profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- faculty_profiles
DROP POLICY IF EXISTS "Faculty can manage their own profile" ON public.faculty_profiles;
CREATE POLICY "Faculty can manage their own profile" ON public.faculty_profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "Institutions can view allowed faculty" ON public.faculty_profiles;
CREATE POLICY "Institutions can view allowed faculty" ON public.faculty_profiles FOR SELECT USING (
    (visibility <> 'hidden') AND 
    NOT EXISTS (
        SELECT 1 FROM public.visibility_rules 
        WHERE visibility_rules.faculty_id = faculty_profiles.id 
        AND visibility_rules.institution_id = auth.uid() 
        AND visibility_rules.rule = 'block'
    )
);

-- faculty_expertise
DROP POLICY IF EXISTS "Faculty manage own expertise" ON public.faculty_expertise;
CREATE POLICY "Faculty manage own expertise" ON public.faculty_expertise FOR ALL USING (auth.uid() = faculty_id);
DROP POLICY IF EXISTS "Institutions view allowed expertise" ON public.faculty_expertise;
CREATE POLICY "Institutions view allowed expertise" ON public.faculty_expertise FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.faculty_profiles 
        WHERE faculty_profiles.id = faculty_expertise.faculty_id
        AND (visibility <> 'hidden')
        AND NOT EXISTS (
            SELECT 1 FROM public.visibility_rules 
            WHERE visibility_rules.faculty_id = faculty_profiles.id 
            AND visibility_rules.institution_id = auth.uid() 
            AND visibility_rules.rule = 'block'
        )
    )
);

-- faculty_documents
DROP POLICY IF EXISTS "Faculty manage own documents" ON public.faculty_documents;
CREATE POLICY "Faculty manage own documents" ON public.faculty_documents FOR ALL USING (auth.uid() = faculty_id);
DROP POLICY IF EXISTS "Institutions view public documents" ON public.faculty_documents;
CREATE POLICY "Institutions view public documents" ON public.faculty_documents FOR SELECT USING (
    is_public AND EXISTS (
        SELECT 1 FROM public.faculty_profiles 
        WHERE faculty_profiles.id = faculty_documents.faculty_id
        AND (visibility <> 'hidden')
        AND NOT EXISTS (
            SELECT 1 FROM public.visibility_rules 
            WHERE visibility_rules.faculty_id = faculty_profiles.id 
            AND visibility_rules.institution_id = auth.uid() 
            AND visibility_rules.rule = 'block'
        )
    )
);

-- institutions
DROP POLICY IF EXISTS "Institutions viewable by everyone" ON public.institutions;
CREATE POLICY "Institutions viewable by everyone" ON public.institutions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Institutions manage own profile" ON public.institutions;
CREATE POLICY "Institutions manage own profile" ON public.institutions FOR ALL USING (auth.uid() = id);

-- visibility_rules
DROP POLICY IF EXISTS "Faculty manage visibility rules" ON public.visibility_rules;
CREATE POLICY "Faculty manage visibility rules" ON public.visibility_rules FOR ALL USING (auth.uid() = faculty_id);

-- favorites
DROP POLICY IF EXISTS "Institutions manage favorites" ON public.favorites;
CREATE POLICY "Institutions manage favorites" ON public.favorites FOR ALL USING (auth.uid() = institution_id);

-- contacts
DROP POLICY IF EXISTS "Institutions create contacts" ON public.contacts;
CREATE POLICY "Institutions create contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = institution_id);
DROP POLICY IF EXISTS "Institutions view sent contacts" ON public.contacts;
CREATE POLICY "Institutions view sent contacts" ON public.contacts FOR SELECT USING (auth.uid() = institution_id);
DROP POLICY IF EXISTS "Faculty view received contacts" ON public.contacts;
CREATE POLICY "Faculty view received contacts" ON public.contacts FOR SELECT USING (auth.uid() = faculty_id);
DROP POLICY IF EXISTS "Faculty respond to contacts" ON public.contacts;
CREATE POLICY "Faculty respond to contacts" ON public.contacts FOR UPDATE USING (auth.uid() = faculty_id);
