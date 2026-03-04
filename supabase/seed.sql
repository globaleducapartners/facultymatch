-- ====================================================================================
-- SEED DE DATOS DE PRUEBA (FACULTYMATCH)
-- ====================
-- REQUERIDO: Para que este script funcione, DEBES crear primero los usuarios en 
-- Supabase Authentication y copiar sus UUIDs aquí debajo.
-- ====================================================================================

/*
-- PEGA AQUÍ LOS UUIDS QUE HAYAS CREADO:
SET SESSION my.faculty_id_1 = 'UUID-AQUI';
SET SESSION my.faculty_id_2 = 'UUID-AQUI';
SET SESSION my.faculty_id_3 = 'UUID-AQUI';
SET SESSION my.faculty_id_4 = 'UUID-AQUI';
SET SESSION my.faculty_id_5 = 'UUID-AQUI';
SET SESSION my.faculty_id_6 = 'UUID-AQUI';
SET SESSION my.faculty_id_7 = 'UUID-AQUI';
SET SESSION my.faculty_id_8 = 'UUID-AQUI';
SET SESSION my.faculty_id_9 = 'UUID-AQUI';
SET SESSION my.faculty_id_10 = 'UUID-AQUI';
SET SESSION my.institution_id = 'UUID-AQUI';
*/

BEGIN;

-- 1. Actualizar perfiles de docentes (asumiendo que el trigger ya los creó)
-- Si el trigger está activo, solo necesitamos actualizar los campos extra.

-- Docente 1 (Ejemplo de actualización con variables si se usan arriba)
-- UPDATE public.faculty_profiles SET visibility = 'public' WHERE id = current_setting('my.faculty_id_1')::uuid;

-- Como el trigger ya crea la entrada en user_profiles y faculty_profiles, 
-- el seed puede enfocarse en expertise y otros datos.

-- EXPERTISE (Ejemplos con UUIDs reales - Reemplazar con los generados)
/*
INSERT INTO public.faculty_expertise (faculty_id, field, area, sub_area)
VALUES 
  ('REEMPLAZAR-CON-UUID-1', 'Tecnología', 'Inteligencia Artificial', 'Machine Learning'),
  ('REEMPLAZAR-CON-UUID-2', 'Medicina', 'Cardiología', 'Intervencionismo'),
  ('REEMPLAZAR-CON-UUID-3', 'Negocios', 'Marketing', 'Digital Strategy')
ON CONFLICT DO NOTHING;
*/

COMMIT;

-- INSTRUCCIONES FINALES:
-- 1. Ve a Supabase Dashboard > Authentication.
-- 2. Crea 11 usuarios (10 docentes, 1 institución).
-- 3. Copia sus IDs de la columna "User ID".
-- 4. Reemplaza los placeholders en este archivo o ejecútalo por partes en el SQL Editor.
