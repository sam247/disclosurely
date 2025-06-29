
-- Add custom domain fields to organizations table for Tier 2 branding
ALTER TABLE public.organizations 
ADD COLUMN custom_domain TEXT,
ADD COLUMN domain_verified BOOLEAN DEFAULT false,
ADD COLUMN domain_verification_token TEXT,
ADD COLUMN custom_domain_enabled BOOLEAN DEFAULT false;

-- Create a table to store domain verification records
CREATE TABLE public.domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  verification_type TEXT NOT NULL DEFAULT 'CNAME', -- CNAME, TXT, etc.
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, domain)
);

-- Enable RLS on domain verifications
ALTER TABLE public.domain_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for domain verifications - only organization members can manage
CREATE POLICY "Organization members can manage domain verifications"
  ON public.domain_verifications
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Function to generate domain verification token
CREATE OR REPLACE FUNCTION public.generate_domain_verification_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  token := 'disclosurely-verify-' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 16));
  RETURN token;
END;
$$;

-- Trigger to auto-generate verification token
CREATE OR REPLACE FUNCTION public.set_domain_verification_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.verification_token IS NULL OR NEW.verification_token = '' THEN
    NEW.verification_token := generate_domain_verification_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_domain_verification_token_trigger
  BEFORE INSERT ON public.domain_verifications
  FOR EACH ROW EXECUTE FUNCTION set_domain_verification_token();
