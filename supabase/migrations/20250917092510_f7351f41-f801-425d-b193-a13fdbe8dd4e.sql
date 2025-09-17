-- Call the new email notification processing function to handle any pending notifications
SELECT net.http_post(
  url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/process-pending-email-notifications',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1OTUwMSwiZXhwIjoyMDY1ODM1NTAxfQ.dYJ0qN7R6h_l4eZwvxrWXF_vq7Yv10nA-Tl8cZ6-bNQ'
  ),
  body := '{}'::jsonb
);