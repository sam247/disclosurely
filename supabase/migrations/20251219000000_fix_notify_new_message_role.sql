-- Fix notify_new_message function to use user_roles instead of profiles.role
-- This fixes the "column p.role does not exist" error when sending messages

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  report_record RECORD;
BEGIN
  SELECT r.*, o.id as org_id INTO report_record
  FROM reports r
  JOIN organizations o ON r.organization_id = o.id
  WHERE r.id = NEW.report_id;
  
  -- If message is from organization to whistleblower, no internal notification needed
  IF NEW.sender_type = 'organization' THEN
    RETURN NEW;
  END IF;
  
  -- Create notifications for organization users when whistleblower sends message
  -- Use user_roles table instead of profiles.role
  INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    report_record.org_id,
    NEW.report_id,
    'new_message',
    'New Message on Report',
    'New message received on report "' || report_record.title || '"',
    jsonb_build_object('tracking_id', report_record.tracking_id, 'sender_type', NEW.sender_type)
  FROM profiles p
  JOIN user_roles ur ON p.id = ur.user_id AND ur.organization_id = report_record.org_id
  WHERE p.organization_id = report_record.org_id 
    AND p.is_active = true
    AND ur.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$;
