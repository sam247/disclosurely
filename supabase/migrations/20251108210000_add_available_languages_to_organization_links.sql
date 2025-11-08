-- Add available_languages column to organization_links table
-- This allows admins to select which languages appear in the form
-- Stored as JSONB array of language codes (e.g., ["en", "es", "fr"])

ALTER TABLE public.organization_links
ADD COLUMN IF NOT EXISTS available_languages JSONB DEFAULT '["en", "es", "fr", "de", "pl", "sv", "no", "pt", "it", "nl", "da", "el"]'::jsonb;

COMMENT ON COLUMN public.organization_links.available_languages IS 'Array of language codes that should appear in the form. If null or empty, all languages are available.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_organization_links_available_languages ON public.organization_links USING GIN (available_languages);

