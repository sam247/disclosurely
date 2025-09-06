-- Phase 3: Apply final security fixes that haven't been implemented

-- 1. Create secure RPC for link validation to prevent enumeration
CREATE OR REPLACE FUNCTION public.get_link_branding(p_link_token text)
RETURNS TABLE(
  organization_name text,
  brand_color text,
  custom_logo_url text,
  valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.name,
    o.brand_color,
    o.custom_logo_url,
    (ol.is_active = true 
     AND (ol.expires_at IS NULL OR ol.expires_at > now())
     AND (ol.usage_limit IS NULL OR ol.usage_count < ol.usage_limit)
    ) as valid
  FROM organization_links ol
  JOIN organizations o ON o.id = ol.organization_id
  WHERE ol.link_token = p_link_token
  LIMIT 1;
END;
$$;

-- 2. Add constraint to email_notifications to prevent unrestricted writes
DROP POLICY IF EXISTS "System can create email notifications" ON public.email_notifications;
CREATE POLICY "System only can create email notifications" 
ON public.email_notifications 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 3. Fix cookie_consents overly permissive policy
DROP POLICY IF EXISTS "Allow cookie consent management" ON public.cookie_consents;
CREATE POLICY "Allow cookie consent creation only" 
ON public.cookie_consents 
FOR INSERT 
WITH CHECK (true);

-- Allow reading for compliance purposes (organization-scoped)
CREATE POLICY "Organization members can view cookie consents" 
ON public.cookie_consents 
FOR SELECT 
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_active = true
  )
);

-- 4. Restrict login_attempts to system-only writes
DROP POLICY IF EXISTS "System can insert login attempts" ON public.login_attempts;
CREATE POLICY "System only can insert login attempts" 
ON public.login_attempts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');