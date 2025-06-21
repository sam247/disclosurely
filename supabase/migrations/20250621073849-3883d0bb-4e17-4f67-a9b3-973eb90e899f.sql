
-- First, let's add RLS policies to the existing tables that need organization-level access control
-- Enable RLS on reports table if not already enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy for reports - users can only see reports from their organization
CREATE POLICY "Users can view organization reports" 
  ON public.reports 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy for reports - users can update reports from their organization
CREATE POLICY "Users can update organization reports" 
  ON public.reports 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Enable RLS on report_notes table
ALTER TABLE public.report_notes ENABLE ROW LEVEL SECURITY;

-- Policy for report_notes - users can view notes for reports in their organization
CREATE POLICY "Users can view report notes in their organization" 
  ON public.report_notes 
  FOR SELECT 
  USING (
    report_id IN (
      SELECT r.id 
      FROM public.reports r
      JOIN public.profiles p ON p.organization_id = r.organization_id
      WHERE p.id = auth.uid()
    )
  );

-- Policy for report_notes - users can create notes for reports in their organization
CREATE POLICY "Users can create report notes in their organization" 
  ON public.report_notes 
  FOR INSERT 
  WITH CHECK (
    report_id IN (
      SELECT r.id 
      FROM public.reports r
      JOIN public.profiles p ON p.organization_id = r.organization_id
      WHERE p.id = auth.uid()
    )
  );

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for profiles - users can view profiles in their organization
CREATE POLICY "Users can view organization profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    organization_id = (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    ) OR id = auth.uid()
  );

-- Policy for profiles - org_admins can update profiles in their organization
CREATE POLICY "Org admins can update organization profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id 
      FROM public.profiles 
      WHERE organization_id = profiles.organization_id 
      AND role = 'org_admin'
    )
  );

-- Create a table for user invitations
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'case_handler',
  invited_by UUID REFERENCES public.profiles(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Enable RLS on user_invitations (fixed syntax)
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Policy for invitations - org_admins can manage invitations for their organization
CREATE POLICY "Org admins can manage invitations" 
  ON public.user_invitations 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() AND role = 'org_admin'
    )
  );

-- Function to generate invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 32));
  
  WHILE EXISTS (SELECT 1 FROM public.user_invitations WHERE token = token) LOOP
    token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 32));
  END LOOP;
  
  RETURN token;
END;
$$;

-- Trigger to set invitation token
CREATE OR REPLACE FUNCTION public.set_invitation_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invitation_token_trigger
  BEFORE INSERT ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invitation_token();
