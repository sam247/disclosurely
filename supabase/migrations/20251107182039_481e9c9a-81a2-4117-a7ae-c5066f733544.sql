-- Allow anonymous users to read active custom domains for reporting
-- This is necessary for whistleblowers to access the reporting portal via custom domains

CREATE POLICY "Anonymous users can view active custom domains"
ON public.custom_domains
FOR SELECT
TO anon
USING (
  is_active = true 
  AND status = 'active'
);

-- Also ensure authenticated users can still view active domains
CREATE POLICY "Authenticated users can view active custom domains"
ON public.custom_domains
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND status = 'active'
);

COMMENT ON POLICY "Anonymous users can view active custom domains" ON public.custom_domains IS 
'Allows anonymous whistleblowers to access reporting portals via custom domains. Only exposes active domains with minimal information.';
