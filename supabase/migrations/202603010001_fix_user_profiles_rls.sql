-- Fix RLS recursion on public.user_profiles
-- Minimal safe policies: user can select/insert/update ONLY their row (id = auth.uid())

begin;

alter table if exists public.user_profiles enable row level security;

-- Drop ALL existing policies on user_profiles (avoid recursion)
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

-- Minimal policies (NO subqueries to user_profiles)
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

commit;
