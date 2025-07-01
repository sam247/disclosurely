
-- Create GDPR compliance tables
CREATE TABLE public.data_retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  retention_period_months INTEGER NOT NULL DEFAULT 36,
  auto_purge_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data export requests table
CREATE TABLE public.data_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id),
  email_address TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('full_export', 'report_data', 'personal_data')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_file_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create data erasure requests table
CREATE TABLE public.data_erasure_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id),
  email_address TEXT NOT NULL,
  erasure_type TEXT NOT NULL CHECK (erasure_type IN ('full_erasure', 'anonymize_reports', 'delete_personal_data')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create cookie consent table
CREATE TABLE public.cookie_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  necessary_cookies BOOLEAN NOT NULL DEFAULT true,
  analytics_cookies BOOLEAN NOT NULL DEFAULT false,
  marketing_cookies BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 year')
);

-- Enable RLS on all GDPR tables
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_erasure_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

-- RLS policies for data_retention_policies
CREATE POLICY "Organization members can view retention policies"
ON public.data_retention_policies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = data_retention_policies.organization_id
    AND p.is_active = true
  )
);

CREATE POLICY "Organization admins can manage retention policies"
ON public.data_retention_policies FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = data_retention_policies.organization_id
    AND p.role IN ('admin', 'org_admin')
    AND p.is_active = true
  )
);

-- RLS policies for data_export_requests
CREATE POLICY "Users can view their own export requests"
ON public.data_export_requests FOR SELECT
TO authenticated
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = data_export_requests.organization_id
    AND p.role IN ('admin', 'org_admin')
    AND p.is_active = true
  )
);

CREATE POLICY "Users can create export requests"
ON public.data_export_requests FOR INSERT
TO authenticated
WITH CHECK (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = data_export_requests.organization_id
    AND p.role IN ('admin', 'org_admin')
    AND p.is_active = true
  )
);

-- RLS policies for data_erasure_requests
CREATE POLICY "Users can view their own erasure requests"
ON public.data_erasure_requests FOR SELECT
TO authenticated
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = data_erasure_requests.organization_id
    AND p.role IN ('admin', 'org_admin')
    AND p.is_active = true
  )
);

CREATE POLICY "Users can create erasure requests"
ON public.data_erasure_requests FOR INSERT
TO authenticated
WITH CHECK (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = data_erasure_requests.organization_id
    AND p.role IN ('admin', 'org_admin')
    AND p.is_active = true
  )
);

CREATE POLICY "Organization admins can manage erasure requests"
ON public.data_erasure_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = data_erasure_requests.organization_id
    AND p.role IN ('admin', 'org_admin')
    AND p.is_active = true
  )
);

-- RLS policies for cookie_consents (public access for cookie consent)
CREATE POLICY "Allow cookie consent management"
ON public.cookie_consents FOR ALL
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_data_retention_policies_org_id ON public.data_retention_policies(organization_id);
CREATE INDEX idx_data_export_requests_org_id ON public.data_export_requests(organization_id);
CREATE INDEX idx_data_export_requests_status ON public.data_export_requests(status);
CREATE INDEX idx_data_erasure_requests_org_id ON public.data_erasure_requests(organization_id);
CREATE INDEX idx_data_erasure_requests_status ON public.data_erasure_requests(status);
CREATE INDEX idx_cookie_consents_org_id ON public.cookie_consents(organization_id);
CREATE INDEX idx_cookie_consents_expires_at ON public.cookie_consents(expires_at);

-- Create function to automatically set default retention policies for new organizations
CREATE OR REPLACE FUNCTION public.create_default_retention_policies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default retention policies for new organization
  INSERT INTO public.data_retention_policies (organization_id, data_type, retention_period_months, auto_purge_enabled)
  VALUES 
    (NEW.id, 'reports', 36, false),
    (NEW.id, 'messages', 36, false),
    (NEW.id, 'attachments', 36, false),
    (NEW.id, 'audit_logs', 24, true),
    (NEW.id, 'user_profiles', 60, false);
  
  RETURN NEW;
END;
$$;

-- Create trigger to set default retention policies
CREATE TRIGGER create_default_retention_policies_trigger
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_retention_policies();
