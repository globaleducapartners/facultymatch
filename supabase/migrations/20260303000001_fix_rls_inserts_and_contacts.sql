begin;

-- 1) Añadir columnas opcionales en contacts (porque el UI/seed las usa)
alter table public.contacts
  add column if not exists subject text,
  add column if not exists program text,
  add column if not exists dates text,
  add column if not exists modality text;

-- 2) user_profiles: permitir SELECT propio + instituciones/admin sin recursion
-- (NO usar subqueries a user_profiles para evitar "infinite recursion")
drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_select_safe" on public.user_profiles;
create policy "user_profiles_select_safe"
on public.user_profiles
for select
using (
  id = auth.uid()
  OR (auth.jwt() -> 'user_metadata' ->> 'role') in ('institution','admin','super_admin')
);

-- Mantener insert/update propio (ya existen en migración previa, pero aseguramos drop/create para consistencia si hace falta)
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
with check (id = auth.uid());

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- 3) faculty_profiles: añadir INSERT explícito
drop policy if exists "faculty_profiles_insert_own" on public.faculty_profiles;
create policy "faculty_profiles_insert_own"
on public.faculty_profiles
for insert
with check (auth.uid() = id);

-- 4) institutions: añadir INSERT explícito (clave para que signup de institución funcione)
drop policy if exists "institutions_insert_own" on public.institutions;
create policy "institutions_insert_own"
on public.institutions
for insert
with check (auth.uid() = id);

-- 5) faculty_expertise: añadir INSERT/UPDATE/DELETE explícitos con WITH CHECK
drop policy if exists "faculty_expertise_insert_own" on public.faculty_expertise;
create policy "faculty_expertise_insert_own"
on public.faculty_expertise
for insert
with check (auth.uid() = faculty_id);

drop policy if exists "faculty_expertise_update_own" on public.faculty_expertise;
create policy "faculty_expertise_update_own"
on public.faculty_expertise
for update
using (auth.uid() = faculty_id)
with check (auth.uid() = faculty_id);

drop policy if exists "faculty_expertise_delete_own" on public.faculty_expertise;
create policy "faculty_expertise_delete_own"
on public.faculty_expertise
for delete
using (auth.uid() = faculty_id);

commit;
