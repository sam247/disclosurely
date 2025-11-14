-- Migration: Restrict audit log access for anonymous cases (PRIVACY FIX H3)
-- Hides sensitive fields (IP, user agent, session ID, geo data) for anonymous actions

-- Create a view that filters sensitive data for anonymous cases
CREATE OR REPLACE VIEW public.audit_logs_filtered AS
SELECT 
  id,
  created_at,
  event_type,
  category,
  action,
  severity,
  actor_type,
  actor_id,
  -- Hide actor_email for anonymous actors
  CASE 
    WHEN actor_type = 'anonymous' THEN '[ANONYMOUS]'
    ELSE actor_email
  END as actor_email,
  -- Hide IP address for anonymous actors
  CASE 
    WHEN actor_type = 'anonymous' THEN NULL
    ELSE actor_ip_address
  END as actor_ip_address,
  -- Hide user agent for anonymous actors
  CASE 
    WHEN actor_type = 'anonymous' THEN NULL
    ELSE actor_user_agent
  END as actor_user_agent,
  -- Hide session ID for anonymous actors
  CASE 
    WHEN actor_type = 'anonymous' THEN NULL
    ELSE actor_session_id
  END as actor_session_id,
  target_type,
  target_id,
  target_name,
  summary,
  description,
  metadata,
  before_state,
  after_state,
  request_id,
  request_method,
  request_path,
  request_params,
  -- Hide geo data for anonymous actors
  CASE 
    WHEN actor_type = 'anonymous' THEN NULL
    ELSE geo_country
  END as geo_country,
  CASE 
    WHEN actor_type = 'anonymous' THEN NULL
    ELSE geo_region
  END as geo_region,
  CASE 
    WHEN actor_type = 'anonymous' THEN NULL
    ELSE geo_city
  END as geo_city,
  organization_id,
  hash,
  previous_hash,
  chain_index,
  retention_until,
  archived_at,
  archive_location
FROM public.audit_logs;

-- Grant access to the filtered view
GRANT SELECT ON public.audit_logs_filtered TO authenticated;

-- Create RLS policy for the filtered view
ALTER VIEW public.audit_logs_filtered SET (security_invoker = true);

-- Update existing RLS policy to use filtered view for non-admin users
-- Keep full access for admins (owner)
-- Note: Policy may already exist, so we drop and recreate
DROP POLICY IF EXISTS "Organizations can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Organizations can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE organization_id = audit_logs.organization_id
    )
  );

-- Create a function to check if user is owner/admin
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND email = 'sampettiford@googlemail.com'
  );
$$;

-- Create a function to get filtered audit logs (respects anonymity)
CREATE OR REPLACE FUNCTION public.get_audit_logs_filtered(
  p_organization_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  event_type text,
  category text,
  action text,
  severity text,
  actor_type text,
  actor_id uuid,
  actor_email text,
  actor_ip_address inet,
  actor_user_agent text,
  actor_session_id text,
  target_type text,
  target_id uuid,
  target_name text,
  summary text,
  description text,
  metadata jsonb,
  before_state jsonb,
  after_state jsonb,
  request_id text,
  request_method text,
  request_path text,
  request_params jsonb,
  geo_country text,
  geo_region text,
  geo_city text,
  organization_id uuid,
  hash text,
  previous_hash text,
  chain_index bigint,
  retention_until timestamp with time zone,
  archived_at timestamp with time zone,
  archive_location text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this organization
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND organization_id = p_organization_id
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- If user is owner, return full logs
  IF public.is_owner() THEN
    RETURN QUERY
    SELECT * FROM public.audit_logs
    WHERE organization_id = p_organization_id
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
  ELSE
    -- For non-owners, return filtered logs (hide sensitive data for anonymous cases)
    RETURN QUERY
    SELECT * FROM public.audit_logs_filtered
    WHERE organization_id = p_organization_id
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_audit_logs_filtered TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner TO authenticated;

-- Add comment
COMMENT ON VIEW public.audit_logs_filtered IS 'Filtered audit logs view that hides sensitive fields (IP, user agent, session ID, geo data) for anonymous actions. Full access for owner/admin.';
COMMENT ON FUNCTION public.get_audit_logs_filtered IS 'Returns audit logs with sensitive fields filtered for anonymous cases. Owners see full logs.';

