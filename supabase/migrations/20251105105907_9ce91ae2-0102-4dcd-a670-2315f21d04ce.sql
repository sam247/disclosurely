-- Fix remaining SECURITY DEFINER views
-- Views should use security_invoker to respect RLS of querying user

-- Fix pending_policy_acknowledgments view
DROP VIEW IF EXISTS public.pending_policy_acknowledgments CASCADE;
CREATE VIEW public.pending_policy_acknowledgments 
WITH (security_invoker = true) AS
SELECT 
  pa.id AS assignment_id,
  pa.organization_id,
  pa.policy_id,
  pa.user_id,
  pa.assigned_at,
  pa.due_date,
  pa.reminder_sent_at,
  cp.policy_name,
  cp.policy_type,
  cp.version,
  cp.effective_date,
  p.first_name,
  p.last_name,
  p.email
FROM public.policy_assignments pa
JOIN public.compliance_policies cp ON cp.id = pa.policy_id
JOIN public.profiles p ON p.id = pa.user_id
LEFT JOIN public.policy_acknowledgments pack ON 
  pa.policy_id = pack.policy_id AND
  pa.user_id = pack.user_id AND
  pack.policy_version = cp.version
WHERE pack.id IS NULL
  AND cp.status = 'active';

-- Fix policy_acknowledgment_summary view
DROP VIEW IF EXISTS public.policy_acknowledgment_summary CASCADE;
CREATE VIEW public.policy_acknowledgment_summary
WITH (security_invoker = true) AS
SELECT 
  cp.id AS policy_id,
  cp.organization_id,
  cp.policy_name,
  cp.policy_type,
  cp.version,
  COUNT(DISTINCT pa.user_id) AS total_assigned,
  COUNT(DISTINCT pack.user_id) AS total_acknowledged,
  CASE 
    WHEN COUNT(DISTINCT pa.user_id) > 0 
    THEN ROUND(100.0 * COUNT(DISTINCT pack.user_id) / COUNT(DISTINCT pa.user_id), 2)
    ELSE 0
  END AS acknowledgment_rate
FROM public.compliance_policies cp
LEFT JOIN public.policy_assignments pa ON cp.id = pa.policy_id
LEFT JOIN public.policy_acknowledgments pack ON 
  cp.id = pack.policy_id AND
  pack.policy_version = cp.version
WHERE cp.status = 'active'
GROUP BY cp.id, cp.organization_id, cp.policy_name, cp.policy_type, cp.version;

-- Fix ai_log_insights view
DROP VIEW IF EXISTS public.ai_log_insights CASCADE;
CREATE VIEW public.ai_log_insights
WITH (security_invoker = true) AS
SELECT 
  sl.level,
  sl.context,
  date_trunc('hour', sl.timestamp) as hour_bucket,
  COUNT(*) as log_count,
  COUNT(DISTINCT sl.user_id) as analyzed_count,
  AVG(CASE 
    WHEN sl.level = 'ERROR' THEN 3
    WHEN sl.level = 'WARN' THEN 2
    ELSE 1
  END) as avg_severity,
  array_agg(DISTINCT sl.message) FILTER (WHERE sl.message IS NOT NULL) as patterns
FROM system_logs sl
WHERE sl.timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY sl.level, sl.context, date_trunc('hour', sl.timestamp);

-- Fix recent_critical_issues view
DROP VIEW IF EXISTS public.recent_critical_issues CASCADE;
CREATE VIEW public.recent_critical_issues
WITH (security_invoker = true) AS
SELECT 
  sl.level,
  sl.context,
  sl.message,
  sl.timestamp,
  sl.data,
  CASE 
    WHEN sl.level = 'ERROR' THEN 'critical'
    WHEN sl.level = 'WARN' THEN 'warning'
    ELSE 'info'
  END as severity
FROM system_logs sl
WHERE sl.level IN ('ERROR', 'WARN')
  AND sl.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY sl.timestamp DESC
LIMIT 100;

-- Grant access to views
GRANT SELECT ON public.pending_policy_acknowledgments TO authenticated;
GRANT SELECT ON public.policy_acknowledgment_summary TO authenticated;
GRANT SELECT ON public.ai_log_insights TO authenticated;
GRANT SELECT ON public.recent_critical_issues TO authenticated;