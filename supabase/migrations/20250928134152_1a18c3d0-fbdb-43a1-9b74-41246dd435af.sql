-- Continue securing remaining database functions and fix authentication gaps

-- 1. Secure all remaining public functions that should require authentication

-- Secure link validation functions (these can stay public as they're needed for anonymous access)
-- But add rate limiting logic where appropriate

-- Secure profile access logging
CREATE OR REPLACE FUNCTION public.log_profile_access(p_accessed_user_id uuid, p_access_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users to log profile access
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log when profiles are accessed for auditing
  INSERT INTO audit_logs (
    user_id, 
    event_type, 
    action, 
    result, 
    resource_type, 
    resource_id, 
    details
  ) VALUES (
    auth.uid(),
    'profile_access',
    p_access_type,
    'success',
    'profile',
    p_accessed_user_id::text,
    jsonb_build_object('accessed_user_id', p_accessed_user_id, 'timestamp', now())
  );
END;
$$;

-- Secure messaging logging functions
CREATE OR REPLACE FUNCTION public.log_messaging_attempt(p_report_id uuid, p_sender_type text, p_success boolean, p_failure_reason text DEFAULT NULL::text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
DECLARE
  report_org_id uuid;
BEGIN
  -- Allow system role or authenticated users
  IF auth.role() != 'service_role' AND auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get organization ID from report
  SELECT organization_id INTO report_org_id FROM reports WHERE id = p_report_id;
  
  PERFORM log_security_event(
    'message_attempt',
    p_user_id,
    report_org_id,
    jsonb_build_object(
      'report_id', p_report_id,
      'sender_type', p_sender_type,
      'success', p_success,
      'failure_reason', p_failure_reason,
      'timestamp', now()
    ),
    p_ip_address,
    p_user_agent,
    CASE WHEN p_success THEN 'low' ELSE 'medium' END
  );
END;
$$;

-- Secure link validation failure logging  
CREATE OR REPLACE FUNCTION public.log_link_validation_failure(p_link_token text, p_failure_reason text, p_organization_id uuid DEFAULT NULL::uuid, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  -- Allow system calls or authenticated users
  IF auth.role() != 'service_role' AND auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  PERFORM log_security_event(
    'link_validation_failure',
    NULL, -- user_id (anonymous attempt)
    p_organization_id,
    jsonb_build_object(
      'link_token', p_link_token,
      'failure_reason', p_failure_reason,
      'timestamp', now()
    ),
    p_ip_address,
    p_user_agent,
    'medium'
  );
END;
$$;

-- Secure report response times function (make sure it requires authentication)
CREATE OR REPLACE FUNCTION public.get_report_response_times()
 RETURNS TABLE(report_id uuid, tracking_id text, title text, report_created_at timestamp with time zone, organization_id uuid, status report_status, first_org_response_at timestamp with time zone, response_time_hours numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  -- Only return data if user is authenticated and has proper access
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if user has access to organization data
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = ANY(ARRAY['admin'::user_role, 'case_handler'::user_role, 'org_admin'::user_role]) 
    AND p.is_active = true
  ) THEN
    RAISE EXCEPTION 'Insufficient privileges';
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