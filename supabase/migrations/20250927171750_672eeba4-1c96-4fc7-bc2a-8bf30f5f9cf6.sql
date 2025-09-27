-- Fix security definer view issue
-- The report_response_times view was created with SECURITY DEFINER privileges
-- which bypasses RLS policies. We need to recreate it with proper security.

-- First, drop the existing view
DROP VIEW IF EXISTS public.report_response_times;

-- Recreate the view with security_barrier = true
-- This ensures the view respects RLS policies of the underlying tables
CREATE VIEW public.report_response_times 
WITH (security_barrier = true)
AS 
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
GROUP BY r.id, r.tracking_id, r.title, r.created_at, r.organization_id, r.status;