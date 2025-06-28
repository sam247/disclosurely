
-- Add logo_url column to organizations table for custom branding
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS custom_logo_url text;

-- Add a comment to clarify this is for submission page branding
COMMENT ON COLUMN public.organizations.custom_logo_url IS 'Custom logo URL for branded submission pages (Tier 2 feature)';
