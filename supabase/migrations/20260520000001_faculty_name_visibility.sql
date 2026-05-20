-- Add name_visibility to faculty_profiles
-- Values: 'public' (show full name to everyone), 'institutions' (show full name only to institutions, anon sees initials), 'hidden' (only show to institutions as initials)
alter table public.faculty_profiles
  add column if not exists name_visibility text default 'public';
