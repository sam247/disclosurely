-- Fix Security Definer View issue by recreating the view without SECURITY DEFINER
-- This ensures the view runs with the permissions of the querying user, not the view creator
-- The underlying tables (reports, report_messages) already have proper RLS policies

-- Drop the existing view
DROP VIEW IF EXISTS public.report_response_times;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This makes the view run with the permissions of the current user
CREATE VIEW public.report_response_times AS
SELECT 
    r.id AS report_id,
    r.tracking_id,
    r.title,
    r.created_at AS report_created_at,
    r.organization_id,
    r.status,
    min(rm.created_at) AS first_org_response_at,
    CASE
        WHEN (min(rm.created_at) IS NOT NULL) THEN (EXTRACT(epoch FROM (min(rm.created_at) - r.created_at)) / 3600.0)
        ELSE NULL::numeric
    END AS response_time_hours
FROM reports r
LEFT JOIN report_messages rm ON (r.id = rm.report_id AND rm.sender_type = 'organization')
WHERE r.created_at >= (CURRENT_DATE - '30 days'::interval)
GROUP BY r.id, r.tracking_id, r.title, r.created_at, r.organization_id, r.status;