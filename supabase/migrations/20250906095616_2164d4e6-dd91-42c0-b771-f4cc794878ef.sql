-- Phase 3: Critical Database Security Fixes (Continued)

-- 1. Drop existing overly permissive policies on security_alerts
DROP POLICY IF EXISTS "Authenticated users can view security alerts" ON public.security_alerts;
DROP POLICY IF EXISTS "Authenticated users can resolve security alerts" ON public.security_alerts;
DROP POLICY IF EXISTS "System can create security alerts" ON public.security_alerts;

-- 2. Create proper organization-scoped RLS policies for security_alerts
CREATE POLICY "Organization members can view security alerts" 
ON public.security_alerts 
FOR SELECT 
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_active = true
  )
);

CREATE POLICY "Organization admins can resolve security alerts" 
ON public.security_alerts 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'org_admin') 
    AND profiles.is_active = true
  )
) 
WITH CHECK (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'org_admin') 
    AND profiles.is_active = true
  ) 
  AND resolved_by = auth.uid()
);

-- 3. System-only insert policy for security_alerts (Edge Functions only)
CREATE POLICY "System can create security alerts" 
ON public.security_alerts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 4. Restrict system table writes to system-only access
-- Drop permissive policies on audit_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System only can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Drop permissive policies on notifications  
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System only can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 5. Restrict organization_links public access to prevent enumeration
DROP POLICY IF EXISTS "Anonymous can access active links" ON public.organization_links;

-- Create minimal public access policy (only for specific link validation)
CREATE POLICY "Limited anonymous link validation" 
ON public.organization_links 
FOR SELECT 
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND (usage_limit IS NULL OR usage_count < usage_limit)
);

-- 6. Fix search_path warnings on security definer functions
DROP FUNCTION IF EXISTS public.validate_organization_link(uuid);
CREATE OR REPLACE FUNCTION public.validate_organization_link(link_id uuid)
RETURNS TABLE(valid boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  link_record organization_links%ROWTYPE;
BEGIN
  SELECT * INTO link_record FROM organization_links WHERE id = link_id;
  
  IF link_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Link not found';
    RETURN;
  END IF;
  
  IF link_record.is_active = false THEN
    RETURN QUERY SELECT false, 'Link is not active';
    RETURN;
  END IF;
  
  IF link_record.expires_at IS NOT NULL AND link_record.expires_at <= now() THEN
    RETURN QUERY SELECT false, 'Link has expired';
    RETURN;
  END IF;
  
  IF link_record.usage_limit IS NOT NULL AND link_record.usage_count >= link_record.usage_limit THEN
    RETURN QUERY SELECT false, 'Link usage limit reached';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, 'Link is valid';
  RETURN;
END;
$$;