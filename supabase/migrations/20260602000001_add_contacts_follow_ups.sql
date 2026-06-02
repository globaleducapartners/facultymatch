-- Migration: Add follow_ups JSONB column to contacts table to store full message history
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS follow_ups JSONB DEFAULT '[]'::jsonb;
