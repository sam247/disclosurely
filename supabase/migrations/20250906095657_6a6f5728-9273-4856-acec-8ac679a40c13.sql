-- Fix remaining function search_path warnings

-- Update update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update all trigger-related functions
DROP FUNCTION IF EXISTS public.increment_link_usage_count();
CREATE OR REPLACE FUNCTION public.increment_link_usage_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE organization_links
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = NEW.submitted_via_link_id;
  
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.create_default_retention_policies();
CREATE OR REPLACE FUNCTION public.create_default_retention_policies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO data_retention_policies (organization_id, data_type, retention_period_months, auto_purge_enabled)
  VALUES 
    (NEW.id, 'reports', 36, false),
    (NEW.id, 'messages', 36, false),
    (NEW.id, 'attachments', 36, false),
    (NEW.id, 'audit_logs', 24, true),
    (NEW.id, 'user_profiles', 60, false);
  
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.notify_new_report();
CREATE OR REPLACE FUNCTION public.notify_new_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    NEW.organization_id,
    NEW.id,
    'new_report',
    'New Report Submitted',
    'A new report "' || NEW.title || '" has been submitted.',
    jsonb_build_object('tracking_id', NEW.tracking_id, 'report_type', NEW.report_type)
  FROM profiles p
  WHERE p.organization_id = NEW.organization_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.notify_report_assignment();
CREATE OR REPLACE FUNCTION public.notify_report_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
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
$$;