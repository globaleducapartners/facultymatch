begin;

-- 1) USER_PROFILES (evitar recursion y permitir insert/update propio + lectura de docentes públicos)
alter table if exists public.user_profiles enable row level security;

do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'user_profiles'
  loop
    execute format('drop policy if exists %I on public.user_profiles', r.policyname);
  end loop;
end $$;

create policy "user_profiles_select_own"
on public.user_profiles
for select
using (id = auth.uid());

create policy "user_profiles_insert_own"
on public.user_profiles
for insert
with check (id = auth.uid());

create policy "user_profiles_update_own"
on public.user_profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- Lectura pública (para instituciones autenticadas) SOLO de docentes con perfil public
-- IMPORTANTE: esta policy NO debe referenciar user_profiles en subqueries (solo faculty_profiles)
create policy "user_profiles_select_public_faculty_names"
on public.user_profiles
for select
to authenticated
using (
  role = 'faculty'
  and exists (
    select 1
    from public.faculty_profiles fp
    where fp.id = public.user_profiles.id
      and fp.visibility = 'public'
  )
);

-- 2) FACULTY_PROFILES (instituciones deben poder leer perfiles public)
alter table if exists public.faculty_profiles enable row level security;

do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'faculty_profiles'
  loop
    execute format('drop policy if exists %I on public.faculty_profiles', r.policyname);
  end loop;
end $$;

-- leer perfil propio
create policy "faculty_profiles_select_own"
on public.faculty_profiles
for select
using (id = auth.uid());

-- leer perfiles públicos (para cualquier usuario autenticado)
create policy "faculty_profiles_select_public"
on public.faculty_profiles
for select
to authenticated
using (visibility = 'public');

-- insertar/editar/borrar perfil propio
create policy "faculty_profiles_insert_own"
on public.faculty_profiles
for insert
with check (id = auth.uid());

create policy "faculty_profiles_update_own"
on public.faculty_profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "faculty_profiles_delete_own"
on public.faculty_profiles
for delete
using (id = auth.uid());

-- 3) FACULTY_EXPERTISE (instituciones leen expertise solo si el faculty es public)
alter table if exists public.faculty_expertise enable row level security;

do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'faculty_expertise'
  loop
    execute format('drop policy if exists %I on public.faculty_expertise', r.policyname);
  end loop;
end $$;

create policy "faculty_expertise_select_own"
on public.faculty_expertise
for select
using (faculty_id = auth.uid());

create policy "faculty_expertise_select_public"
on public.faculty_expertise
for select
to authenticated
using (
  exists (
    select 1
    from public.faculty_profiles fp
    where fp.id = public.faculty_expertise.faculty_id
      and fp.visibility = 'public'
  )
);

create policy "faculty_expertise_insert_own"
on public.faculty_expertise
for insert
with check (faculty_id = auth.uid());

create policy "faculty_expertise_delete_own"
on public.faculty_expertise
for delete
using (faculty_id = auth.uid());

-- 4) FAVORITES (institución gestiona sus favoritos)
alter table if exists public.favorites enable row level security;

do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'favorites'
  loop
    execute format('drop policy if exists %I on public.favorites', r.policyname);
  end loop;
end $$;

create policy "favorites_select_own"
on public.favorites
for select
using (institution_id = auth.uid());

create policy "favorites_insert_own"
on public.favorites
for insert
with check (institution_id = auth.uid());

create policy "favorites_delete_own"
on public.favorites
for delete
using (institution_id = auth.uid());

-- 5) CONTACTS (institución crea, institución y docente leen, ambos actualizan)
alter table if exists public.contacts enable row level security;

do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'contacts'
  loop
    execute format('drop policy if exists %I on public.contacts', r.policyname);
  end loop;
end $$;

create policy "contacts_select_parties"
on public.contacts
for select
using (institution_id = auth.uid() or faculty_id = auth.uid());

create policy "contacts_insert_institution"
on public.contacts
for insert
with check (institution_id = auth.uid());

create policy "contacts_update_parties"
on public.contacts
for update
using (institution_id = auth.uid() or faculty_id = auth.uid())
with check (institution_id = auth.uid() or faculty_id = auth.uid());

commit;
