-- ============================================
-- CRITICAL SECURITY FIXES
-- ============================================

-- 1. CREATE USER ROLES TABLE AND FUNCTION
-- This separates role management from user profiles to prevent privilege escalation

CREATE TYPE public.app_role AS ENUM ('admin', 'org_admin', 'case_handler', 'reviewer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true NOT NULL,
  UNIQUE (user_id, role, organization_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Org admins can view organization roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT ur.organization_id FROM user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role IN ('admin', 'org_admin') 
  AND ur.is_active = true
));

CREATE POLICY "System can manage roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create the has_role function with proper security
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = _role 
    AND is_active = true
  )
$$;

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, organization_id, granted_at, is_active)
SELECT 
  id,
  CASE role::text
    WHEN 'admin' THEN 'admin'::app_role
    WHEN 'org_admin' THEN 'org_admin'::app_role
    WHEN 'case_handler' THEN 'case_handler'::app_role
    ELSE 'case_handler'::app_role
  END,
  organization_id,
  created_at,
  is_active
FROM public.profiles
WHERE role IS NOT NULL AND organization_id IS NOT NULL
ON CONFLICT (user_id, role, organization_id) DO NOTHING;

-- 2. CREATE SECURE RPC FUNCTION FOR ORGANIZATION BRANDING
-- This replaces public SELECT access to organizations table

CREATE OR REPLACE FUNCTION public.get_organization_branding_by_link(p_link_token TEXT)
RETURNS TABLE(
  organization_id UUID,
  organization_name TEXT,
  logo_url TEXT,
  custom_logo_url TEXT,
  brand_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.logo_url,
    o.custom_logo_url,
    o.brand_color
  FROM organizations o
  JOIN organization_links ol ON ol.organization_id = o.id
  WHERE ol.link_token = p_link_token
    AND ol.is_active = true
    AND (ol.expires_at IS NULL OR ol.expires_at > now())
    AND (ol.usage_limit IS NULL OR ol.usage_count < ol.usage_limit)
  LIMIT 1;
END;
$$;

-- 3. CREATE SECURE RPC FUNCTION FOR LINK VALIDATION
-- This replaces public SELECT access to organization_links table

CREATE OR REPLACE FUNCTION public.validate_submission_link(p_link_token TEXT)
RETURNS TABLE(
  link_id UUID,
  organization_id UUID,
  is_valid BOOLEAN,
  reason TEXT,
  custom_fields JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  link_record RECORD;
BEGIN
  SELECT * INTO link_record
  FROM organization_links
  WHERE link_token = p_link_token;
  
  IF link_record.id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, false, 'Link not found', NULL::JSONB;
    RETURN;
  END IF;
  
  IF link_record.is_active = false THEN
    RETURN QUERY SELECT link_record.id, link_record.organization_id, false, 'Link is not active', NULL::JSONB;
    RETURN;
  END IF;
  
  IF link_record.expires_at IS NOT NULL AND link_record.expires_at <= now() THEN
    RETURN QUERY SELECT link_record.id, link_record.organization_id, false, 'Link has expired', NULL::JSONB;
    RETURN;
  END IF;
  
  IF link_record.usage_limit IS NOT NULL AND link_record.usage_count >= link_record.usage_limit THEN
    RETURN QUERY SELECT link_record.id, link_record.organization_id, false, 'Link usage limit reached', NULL::JSONB;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT link_record.id, link_record.organization_id, true, 'Link is valid', link_record.custom_fields;
END;
$$;

-- 4. FIX EXISTING SECURITY DEFINER FUNCTIONS - ADD search_path

-- Fix get_user_organization_safe
CREATE OR REPLACE FUNCTION public.get_user_organization_safe(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_org_id uuid;
BEGIN
  SELECT organization_id INTO user_org_id
  FROM profiles 
  WHERE id = p_user_id AND is_active = true;
  
  RETURN user_org_id;
END;
$function$;

-- Fix user_has_role function
CREATE OR REPLACE FUNCTION public.user_has_role(p_user_id uuid, p_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id AND role = p_role AND is_active = true
  );
END;
$function$;

-- Fix get_user_profile_safe
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(p_user_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text, role user_role, is_active boolean, organization_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    p.is_active,
    p.organization_id
  FROM profiles p
  WHERE p.id = p_user_id
  AND (
    p.id = auth.uid()
    OR p.organization_id IN (
      SELECT org_p.organization_id 
      FROM profiles org_p 
      WHERE org_p.id = auth.uid() 
      AND org_p.is_active = true
    )
  );
END;
$function$;

-- Fix get_organization_by_tracking_id
CREATE OR REPLACE FUNCTION public.get_organization_by_tracking_id(p_tracking_id text)
RETURNS TABLE(organization_id uuid, organization_name text, logo_url text, custom_logo_url text, brand_color text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.organization_id,
    o.name as organization_name,
    o.logo_url,
    o.custom_logo_url,
    o.brand_color
  FROM reports r
  JOIN organizations o ON o.id = r.organization_id
  WHERE r.tracking_id = p_tracking_id
  LIMIT 1;
END;
$function$;

-- 5. REMOVE PUBLIC ACCESS TO SENSITIVE TABLES
-- Drop overly permissive policies

DROP POLICY IF EXISTS "Limited public access to organization branding only" ON public.organizations;
DROP POLICY IF EXISTS "Limited anonymous link validation" ON public.organization_links;

-- Add restricted policies that require using the RPC functions
CREATE POLICY "Authenticated users can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (id IN (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid() AND is_active = true
));

CREATE POLICY "Authenticated users can view their org links"
ON public.organization_links
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid() AND is_active = true
));

-- 6. ADD EXPLICIT DENY POLICY FOR PROFILES
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 7. ADD AUDIT LOGGING FOR ROLE CHANGES
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      organization_id, event_type, category, action, 
      actor_id, target_id, severity, summary, metadata
    ) VALUES (
      NEW.organization_id, 'role_management', 'security', 'role_granted',
      NEW.granted_by, NEW.user_id, 'high',
      'User role granted',
      jsonb_build_object('role', NEW.role, 'granted_at', NEW.granted_at)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
    INSERT INTO audit_logs (
      organization_id, event_type, category, action,
      actor_id, target_id, severity, summary, metadata
    ) VALUES (
      NEW.organization_id, 'role_management', 'security', 'role_revoked',
      NEW.revoked_by, NEW.user_id, 'high',
      'User role revoked',
      jsonb_build_object('role', NEW.role, 'revoked_at', NEW.revoked_at)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_role_changes
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_role_change();