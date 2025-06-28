
-- Drop the audit trail foreign key constraints and table
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Drop the audit action enum type
DROP TYPE IF EXISTS public.audit_action CASCADE;

-- Drop the audit-related functions
DROP FUNCTION IF EXISTS public.create_audit_log(uuid, uuid, uuid, audit_action, jsonb, inet, text) CASCADE;
DROP FUNCTION IF EXISTS public.delete_report_cascade(uuid) CASCADE;

-- Remove any triggers that might be related to audit logging
DROP TRIGGER IF EXISTS notify_report_assignment ON public.reports;
DROP TRIGGER IF EXISTS notify_new_report ON public.reports;
DROP TRIGGER IF EXISTS notify_new_message ON public.report_messages;

-- Recreate the notification triggers without audit logging
CREATE OR REPLACE FUNCTION public.notify_new_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notifications for all active users in the organization
  INSERT INTO public.notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    NEW.organization_id,
    NEW.id,
    'new_report',
    'New Report Submitted',
    'A new report "' || NEW.title || '" has been submitted.',
    jsonb_build_object('tracking_id', NEW.tracking_id, 'report_type', NEW.report_type)
  FROM public.profiles p
  WHERE p.organization_id = NEW.organization_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.notify_report_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if assignment changed and there's an assignee
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, organization_id, report_id, type, title, message, metadata)
    VALUES (
      NEW.assigned_to,
      NEW.organization_id,
      NEW.id,
      'report_assigned',
      'Report Assigned to You',
      'Report "' || NEW.title || '" has been assigned to you.',
      jsonb_build_object('tracking_id', NEW.tracking_id, 'previous_assignee', OLD.assigned_to)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  report_record RECORD;
BEGIN
  -- Get report details
  SELECT r.*, o.id as org_id INTO report_record
  FROM public.reports r
  JOIN public.organizations o ON r.organization_id = o.id
  WHERE r.id = NEW.report_id;
  
  -- If message is from organization to whistleblower, no internal notification needed
  IF NEW.sender_type = 'organization' THEN
    RETURN NEW;
  END IF;
  
  -- Create notifications for organization users when whistleblower sends message
  INSERT INTO public.notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    report_record.org_id,
    NEW.report_id,
    'new_message',
    'New Message on Report',
    'New message received on report "' || report_record.title || '"',
    jsonb_build_object('tracking_id', report_record.tracking_id, 'sender_type', NEW.sender_type)
  FROM public.profiles p
  WHERE p.organization_id = report_record.org_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER notify_new_report
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION notify_new_report();

CREATE TRIGGER notify_report_assignment
  AFTER UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION notify_report_assignment();

CREATE TRIGGER notify_new_message
  AFTER INSERT ON public.report_messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();
