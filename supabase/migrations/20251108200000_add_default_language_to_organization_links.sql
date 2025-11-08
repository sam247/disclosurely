-- Add default_language column to organization_links table
-- This allows admins to set a default language for their submission form

ALTER TABLE public.organization_links
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';

COMMENT ON COLUMN public.organization_links.default_language IS 'Default language code for the submission form (e.g., en, es, fr, de, etc.)';
