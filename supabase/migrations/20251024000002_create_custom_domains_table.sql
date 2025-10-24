-- Create custom_domains table for CNAME feature
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL, -- e.g., "secure.company.com"
  subdomain TEXT NOT NULL,   -- e.g., "secure"
  root_domain TEXT NOT NULL, -- e.g., "company.com"
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'verified', 'active', 'failed', 'suspended')),
  verification_token TEXT,
  verification_method TEXT DEFAULT 'dns' CHECK (verification_method IN ('dns', 'file')),
  dns_record_type TEXT DEFAULT 'CNAME',
  dns_record_value TEXT DEFAULT 'secure.disclosurely.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  activated_at TIMESTAMP WITH TIME ZONE,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE, -- Primary domain for the organization
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(domain_name),
  UNIQUE(organization_id, is_primary) WHERE is_primary = TRUE -- Only one primary domain per org
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_domains_organization_id ON public.custom_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain_name ON public.custom_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON public.custom_domains(status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_active ON public.custom_domains(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see domains for their organization
CREATE POLICY "Users can view domains for their organization" ON public.custom_domains
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert domains for their organization (org admins only)
CREATE POLICY "Org admins can add domains" ON public.custom_domains
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = custom_domains.organization_id
      AND ur.role = 'org_admin'
      AND ur.is_active = TRUE
    )
  );

-- Policy: Users can update domains for their organization (org admins only)
CREATE POLICY "Org admins can update domains" ON public.custom_domains
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = custom_domains.organization_id
      AND ur.role = 'org_admin'
      AND ur.is_active = TRUE
    )
  );

-- Policy: Users can delete domains for their organization (org admins only)
CREATE POLICY "Org admins can delete domains" ON public.custom_domains
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = custom_domains.organization_id
      AND ur.role = 'org_admin'
      AND ur.is_active = TRUE
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_custom_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_custom_domains_updated_at();

-- Function to generate verification token
CREATE OR REPLACE FUNCTION public.generate_domain_verification_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if domain is valid
CREATE OR REPLACE FUNCTION public.is_valid_domain(domain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic domain validation regex
  RETURN domain ~ '^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE public.custom_domains IS 'Custom domains for branded secure links (CNAME feature)';
COMMENT ON COLUMN public.custom_domains.domain_name IS 'Full domain name (e.g., secure.company.com)';
COMMENT ON COLUMN public.custom_domains.subdomain IS 'Subdomain part (e.g., secure)';
COMMENT ON COLUMN public.custom_domains.root_domain IS 'Root domain (e.g., company.com)';
COMMENT ON COLUMN public.custom_domains.status IS 'Domain verification status';
COMMENT ON COLUMN public.custom_domains.is_primary IS 'Whether this is the primary domain for the organization';
