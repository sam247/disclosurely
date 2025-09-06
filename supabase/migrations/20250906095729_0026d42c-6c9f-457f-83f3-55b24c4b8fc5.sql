-- Complete remaining critical security fixes with proper function handling

-- Fix remaining notification functions with search_path
DROP FUNCTION IF EXISTS public.notify_new_message();
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
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
  
  IF NEW.sender_type = 'organization' THEN
    RETURN NEW;
  END IF;
  
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
  WHERE p.organization_id = report_record.org_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.notify_new_report_via_email();
CREATE OR REPLACE FUNCTION public.notify_new_report_via_email()
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

  PERFORM net.http_post(
    url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-new-case-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTk1MDEsImV4cCI6MjA2NTgzNTUwMX0.NxqrBnzSR-dxfWw4mn7nIHB-QTt900MtAh96fCCm1Lg"}'::jsonb,
    body := jsonb_build_object('reportId', NEW.id)
  );
    
  RETURN NEW;
END;
$$;

-- Fix token generation functions
DROP FUNCTION IF EXISTS public.generate_link_token();
CREATE OR REPLACE FUNCTION public.generate_link_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 12));
  
  WHILE EXISTS (SELECT 1 FROM organization_links WHERE link_token = token) LOOP
    token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 12));
  END LOOP;
  
  RETURN token;
END;
$$;

DROP FUNCTION IF EXISTS public.set_link_token();
CREATE OR REPLACE FUNCTION public.set_link_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.link_token IS NULL OR NEW.link_token = '' THEN
    NEW.link_token := generate_link_token();
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.generate_tracking_id();
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'WB-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$;

DROP FUNCTION IF EXISTS public.set_tracking_id();
CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    NEW.tracking_id := generate_tracking_id();
    WHILE EXISTS (SELECT 1 FROM reports WHERE tracking_id = NEW.tracking_id) LOOP
      NEW.tracking_id := generate_tracking_id();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;