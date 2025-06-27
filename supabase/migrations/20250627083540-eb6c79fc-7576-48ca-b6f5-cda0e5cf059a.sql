
-- Create a function to handle cascading delete of reports
CREATE OR REPLACE FUNCTION delete_report_cascade(report_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete in the correct order to avoid foreign key violations
  
  -- 1. Delete notifications
  DELETE FROM public.notifications WHERE report_id = $1;
  
  -- 2. Delete report messages
  DELETE FROM public.report_messages WHERE report_id = $1;
  
  -- 3. Delete report notes
  DELETE FROM public.report_notes WHERE report_id = $1;
  
  -- 4. Delete report attachments
  DELETE FROM public.report_attachments WHERE report_id = $1;
  
  -- 5. Delete audit logs
  DELETE FROM public.audit_logs WHERE report_id = $1;
  
  -- 6. Finally delete the report itself
  DELETE FROM public.reports WHERE id = $1;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
