-- Migration: Add follow_ups JSONB column to contacts table
-- This stores the full conversation thread between institutions and faculty
-- 2026-06-11

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS follow_ups JSONB DEFAULT '[]'::jsonb;

SELECT '✅ follow_ups column migration completed' AS status;