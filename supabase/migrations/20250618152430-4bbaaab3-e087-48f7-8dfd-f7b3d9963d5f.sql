
-- Create enum types for better data integrity
CREATE TYPE public.report_status AS ENUM ('new', 'in_review', 'investigating', 'resolved', 'closed');
CREATE TYPE public.user_role AS ENUM ('admin', 'case_handler', 'reviewer', 'org_admin');
CREATE TYPE public.report_type AS ENUM ('anonymous', 'confidential');
CREATE TYPE public.audit_action AS ENUM ('created', 'updated', 'viewed', 'assigned', 'status_changed', 'message_sent');

-- Organizations table for multi-tenant support
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#2563eb',
  description TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced profiles table with role management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role public.user_role DEFAULT 'case_handler',
  is_active BOOLEAN DEFAULT true,
  mfa_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reports table with encryption support
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tracking_id TEXT UNIQUE NOT NULL,
  report_type public.report_type NOT NULL DEFAULT 'anonymous',
  title TEXT NOT NULL,
  encrypted_content TEXT NOT NULL, -- Encrypted JSON content
  encryption_key_hash TEXT NOT NULL, -- For verification purposes
  status public.report_status DEFAULT 'new',
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  assigned_to UUID REFERENCES public.profiles(id),
  submitted_by_email TEXT, -- Only for confidential reports
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Encrypted file attachments
CREATE TABLE public.report_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  encrypted_file_url TEXT NOT NULL,
  encryption_metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Secure messaging between whistleblowers and case handlers
CREATE TABLE public.report_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('whistleblower', 'handler')),
  sender_id UUID REFERENCES public.profiles(id), -- NULL for whistleblower messages
  encrypted_message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Internal notes for case handlers
CREATE TABLE public.report_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comprehensive audit trail
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  report_id UUID REFERENCES public.reports(id),
  action public.audit_action NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies for multi-tenant security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Organization policies (accessible to org members)
CREATE POLICY "Users can view their organization" 
  ON public.organizations 
  FOR SELECT 
  USING (
    id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Profile policies
CREATE POLICY "Users can view profiles in their organization" 
  ON public.profiles 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

-- Report policies (organization-scoped)
CREATE POLICY "Users can view reports in their organization" 
  ON public.reports 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update reports in their organization" 
  ON public.reports 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Report attachments policies
CREATE POLICY "Users can view attachments for accessible reports" 
  ON public.report_attachments 
  FOR SELECT 
  USING (
    report_id IN (
      SELECT id FROM public.reports 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND is_active = true
      )
    )
  );

-- Message policies
CREATE POLICY "Users can view messages for accessible reports" 
  ON public.report_messages 
  FOR SELECT 
  USING (
    report_id IN (
      SELECT id FROM public.reports 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can create messages for accessible reports" 
  ON public.report_messages 
  FOR INSERT 
  WITH CHECK (
    report_id IN (
      SELECT id FROM public.reports 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND is_active = true
      )
    )
  );

-- Notes policies
CREATE POLICY "Users can view notes for accessible reports" 
  ON public.report_notes 
  FOR SELECT 
  USING (
    report_id IN (
      SELECT id FROM public.reports 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can create notes for accessible reports" 
  ON public.report_notes 
  FOR INSERT 
  WITH CHECK (
    report_id IN (
      SELECT id FROM public.reports 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND is_active = true
      )
    ) AND author_id = auth.uid()
  );

-- Audit log policies
CREATE POLICY "Users can view audit logs for their organization" 
  ON public.audit_logs 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Functions for tracking ID generation
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'WB-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_organization_id UUID,
  p_user_id UUID,
  p_report_id UUID,
  p_action public.audit_action,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    organization_id, user_id, report_id, action, details, ip_address, user_agent
  ) VALUES (
    p_organization_id, p_user_id, p_report_id, p_action, p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic tracking ID generation
CREATE OR REPLACE FUNCTION set_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    NEW.tracking_id := generate_tracking_id();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.reports WHERE tracking_id = NEW.tracking_id) LOOP
      NEW.tracking_id := generate_tracking_id();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_report_tracking_id
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION set_tracking_id();

-- Function to check user permissions
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role public.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id AND role = p_role AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample organization for testing
INSERT INTO public.organizations (name, domain, description) 
VALUES ('Demo Corporation', 'demo-corp', 'Sample organization for testing the whistleblower platform');
