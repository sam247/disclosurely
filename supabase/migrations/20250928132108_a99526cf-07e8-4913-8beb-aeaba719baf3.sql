-- Replace the problematic SECURITY DEFINER view with a SECURITY DEFINER function
-- that includes proper access control checks

-- Drop the existing view
DROP VIEW IF EXISTS public.report_response_times;

-- Create a SECURITY DEFINER function with proper access controls
CREATE OR REPLACE FUNCTION public.get_report_response_times()
RETURNS TABLE (
  report_id uuid,
  tracking_id text,
  title text,
  report_created_at timestamp with time zone,
  organization_id uuid,
  status report_status,
  first_org_response_at timestamp with time zone,
  response_time_hours numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if user is authenticated and has proper access
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Check if user has access to organization data
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = ANY(ARRAY['admin'::user_role, 'case_handler'::user_role, 'org_admin'::user_role]) 
    AND p.is_active = true
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    r.id AS report_id,
    r.tracking_id,
    r.title,
    r.created_at AS report_created_at,
    r.organization_id,
    r.status,
    min(rm.created_at) AS first_org_response_at,
    CASE
      WHEN min(rm.created_at) IS NOT NULL THEN EXTRACT(epoch FROM min(rm.created_at) - r.created_at) / 3600.0
      ELSE NULL::numeric
    END AS response_time_hours
  FROM reports r
  LEFT JOIN report_messages rm ON r.id = rm.report_id AND rm.sender_type = 'organization'::text
  WHERE r.created_at >= (CURRENT_DATE - '30 days'::interval)
    -- Ensure user can only see reports from their organization
    AND r.organization_id IN (
      SELECT p.organization_id 
      FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_active = true
    )
    AND r.deleted_at IS NULL  -- Don't include deleted reports
  GROUP BY r.id, r.tracking_id, r.title, r.created_at, r.organization_id, r.status;
END;
$$;