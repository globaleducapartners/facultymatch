-- SEED DATA FOR DEMO (Idempotent)
-- Instruction: Create users manually in Supabase Dashboard (Authentication > Users) 
-- and replace the placeholders below with their real UUIDs.

-- CONFIG: Replace these UUIDs with real ones from auth.users
-- 10 Faculty IDs
-- f1: '00000000-0000-0000-0000-000000000001'
-- f2: '00000000-0000-0000-0000-000000000002'
-- ...
-- 1 Institution ID
-- i1: '00000000-0000-0000-0000-000000000100'

BEGIN;

-- 1. Insert User Profiles
INSERT INTO public.user_profiles (id, role, full_name, avatar_url)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'faculty', 'Dr. Elena Martínez', 'https://i.pravatar.cc/150?u=elena'),
    ('00000000-0000-0000-0000-000000000002', 'faculty', 'Prof. Carlos Ruiz', 'https://i.pravatar.cc/150?u=carlos'),
    ('00000000-0000-0000-0000-000000000003', 'faculty', 'Dra. Sofía López', 'https://i.pravatar.cc/150?u=sofia'),
    ('00000000-0000-0000-0000-000000000004', 'faculty', 'Ing. Javier Solís', 'https://i.pravatar.cc/150?u=javier'),
    ('00000000-0000-0000-0000-000000000005', 'faculty', 'Dra. Ana Gómez', 'https://i.pravatar.cc/150?u=ana'),
    ('00000000-0000-0000-0000-000000000006', 'faculty', 'Prof. Roberto Silva', 'https://i.pravatar.cc/150?u=roberto'),
    ('00000000-0000-0000-0000-000000000007', 'faculty', 'Dra. Laura Chen', 'https://i.pravatar.cc/150?u=laura'),
    ('00000000-0000-0000-0000-000000000008', 'faculty', 'Prof. David Wilson', 'https://i.pravatar.cc/150?u=david'),
    ('00000000-0000-0000-0000-000000000009', 'faculty', 'Dra. Carmen Vega', 'https://i.pravatar.cc/150?u=carmen'),
    ('00000000-0000-0000-0000-000000000010', 'faculty', 'Ing. Miguel Torres', 'https://i.pravatar.cc/150?u=miguel'),
    ('00000000-0000-0000-0000-000000000100', 'institution', 'Admin Universidad Demo', NULL)
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, avatar_url = EXCLUDED.avatar_url;

-- 2. Insert Faculty Profiles
INSERT INTO public.faculty_profiles (id, headline, bio, location, years_experience, visibility)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Experta en Inteligencia Artificial y Ética', 'Más de 15 años investigando el impacto de la IA en la sociedad.', 'Madrid, España', 15, 'public'),
    ('00000000-0000-0000-0000-000000000002', 'Especialista en Finanzas Corporativas', 'Consultor y profesor con enfoque en mercados emergentes.', 'Ciudad de México, México', 10, 'public'),
    ('00000000-0000-0000-0000-000000000003', 'Psicóloga Organizacional', 'Enfoque en bienestar laboral y retención de talento.', 'Bogotá, Colombia', 12, 'public'),
    ('00000000-0000-0000-0000-000000000004', 'Ingeniero de Datos Senior', 'Experto en arquitecturas escalables y Big Data.', 'Barcelona, España', 8, 'public'),
    ('00000000-0000-0000-0000-000000000005', 'Dra. en Marketing Digital', 'Investigadora de comportamiento del consumidor online.', 'Buenos Aires, Argentina', 14, 'public'),
    ('00000000-0000-0000-0000-000000000006', 'Profesor de Derecho Internacional', 'Especialista en tratados comerciales y derechos humanos.', 'Santiago, Chile', 20, 'public'),
    ('00000000-0000-0000-0000-000000000007', 'Experta en Logística y Supply Chain', 'Optimizando cadenas de suministro globales.', 'Valencia, España', 11, 'public'),
    ('00000000-0000-0000-0000-000000000008', 'Data Scientist / ML Engineer', 'Apasionado por el deep learning y visión computacional.', 'Lima, Perú', 6, 'public'),
    ('00000000-0000-0000-0000-000000000009', 'Investigadora en Bioquímica', 'Liderando proyectos de innovación en biotecnología.', 'Sevilla, España', 18, 'public'),
    ('00000000-0000-0000-0000-000000000010', 'Arquitecto de Software', 'Promotor de clean code y metodologías ágiles.', 'Medellín, Colombia', 9, 'public')
ON CONFLICT (id) DO UPDATE 
SET headline = EXCLUDED.headline, bio = EXCLUDED.bio, location = EXCLUDED.location, years_experience = EXCLUDED.years_experience;

-- 3. Insert Faculty Expertise
INSERT INTO public.faculty_expertise (faculty_id, area, level)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'IA', 'Senior'),
    ('00000000-0000-0000-0000-000000000001', 'Ética', 'Expert'),
    ('00000000-0000-0000-0000-000000000002', 'Finanzas', 'Senior'),
    ('00000000-0000-0000-0000-000000000003', 'Psicología', 'Expert'),
    ('00000000-0000-0000-0000-000000000004', 'Tecnología', 'Senior'),
    ('00000000-0000-0000-0000-000000000005', 'Marketing', 'Senior'),
    ('00000000-0000-0000-0000-000000000006', 'Derecho', 'Expert'),
    ('00000000-0000-0000-0000-000000000007', 'Logística', 'Senior'),
    ('00000000-0000-0000-0000-000000000008', 'IA', 'Intermediate'),
    ('00000000-0000-0000-0000-000000000009', 'Salud', 'Expert'),
    ('00000000-0000-0000-0000-000000000010', 'Tecnología', 'Senior')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Institution
INSERT INTO public.institutions (id, name, location, website)
VALUES 
    ('00000000-0000-0000-0000-000000000100', 'Universidad Tecnológica de Innovación', 'Madrid, España', 'https://uti.edu')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, location = EXCLUDED.location, website = EXCLUDED.website;

-- 5. Favorites Example
INSERT INTO public.favorites (institution_id, faculty_id)
VALUES ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (institution_id, faculty_id) DO NOTHING;

-- 6. Contacts Example
INSERT INTO public.contacts (institution_id, faculty_id, message, subject, program, modality)
VALUES ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000002', 'Nos gustaría invitarle a dar una charla sobre finanzas corporativas.', 'Conferencia Anual', 'Master en ADE', 'Presencial')
ON CONFLICT (id) DO NOTHING;

COMMIT;
