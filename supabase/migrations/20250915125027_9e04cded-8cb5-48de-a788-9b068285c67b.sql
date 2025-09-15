-- Allow public access to organization branding data via tracking ID lookup
-- This is needed for the success page to show proper branding

-- Create a secure function to get organization data by tracking ID without exposing report content
CREATE OR REPLACE FUNCTION public.get_organization_by_tracking_id(p_tracking_id text)
RETURNS TABLE(
  organization_id uuid,
  organization_name text,
  logo_url text,
  custom_logo_url text,
  brand_color text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_organization_by_tracking_id(text) TO anon;