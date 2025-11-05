-- Fix 1: Remove SECURITY DEFINER from views
-- These views should use the querying user's permissions, not elevated privileges

-- Drop and recreate ai_log_insights view without SECURITY DEFINER
DROP VIEW IF EXISTS public.ai_log_insights;
CREATE VIEW public.ai_log_insights AS
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

-- Drop and recreate recent_critical_issues view without SECURITY DEFINER  
DROP VIEW IF EXISTS public.recent_critical_issues;
CREATE VIEW public.recent_critical_issues AS
SELECT 
  sl.level,
  sl.context,
  sl.message,
  sl.timestamp,
  sl.data,
  CASE 
    WHEN sl.level = 'ERROR' THEN array['critical', 'requires_immediate_attention']
    WHEN sl.level = 'WARN' THEN array['warning', 'monitor_closely']
    ELSE array['info']
  END as ai_insights,
  sl.data as ai_analysis,
  CASE 
    WHEN sl.level = 'ERROR' THEN array['escalate_to_admin', 'check_system_status']
    WHEN sl.level = 'WARN' THEN array['monitor', 'review_logs']
    ELSE array['no_action_needed']
  END as ai_recommendations
FROM system_logs sl
WHERE sl.level IN ('ERROR', 'WARN')
  AND sl.timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY sl.timestamp DESC
LIMIT 50;

-- Fix 2: Add search_path to all remaining functions that need it
-- Check a few key functions that might be missing it
ALTER FUNCTION cleanup_expired_redaction_maps() SET search_path = public;
ALTER FUNCTION check_token_limit(uuid, integer) SET search_path = public;
ALTER FUNCTION audit_feature_flag_changes() SET search_path = public;
ALTER FUNCTION create_default_retention_policies() SET search_path = public;
ALTER FUNCTION enable_feature_for_org(text, uuid, boolean) SET search_path = public;
ALTER FUNCTION encrypt_report_server_side(jsonb, uuid) SET search_path = public;