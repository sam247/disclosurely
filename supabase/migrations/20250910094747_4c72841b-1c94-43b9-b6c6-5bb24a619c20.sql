-- Create a view for calculating report response times
CREATE OR REPLACE VIEW report_response_times AS
SELECT 
  r.id as report_id,
  r.tracking_id,
  r.title,
  r.created_at as report_created_at,
  r.organization_id,
  r.status,
  MIN(rm.created_at) as first_org_response_at,
  CASE 
    WHEN MIN(rm.created_at) IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (MIN(rm.created_at) - r.created_at)) / 3600.0 -- Hours
    ELSE NULL 
  END as response_time_hours
FROM reports r
LEFT JOIN report_messages rm ON r.id = rm.report_id 
  AND rm.sender_type = 'organization'
WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days' -- Last 30 days only
GROUP BY r.id, r.tracking_id, r.title, r.created_at, r.organization_id, r.status;