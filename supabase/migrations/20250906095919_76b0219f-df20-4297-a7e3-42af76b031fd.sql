-- Update existing functions in place with proper search_path

-- Update domain verification token function
CREATE OR REPLACE FUNCTION public.set_domain_verification_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_token IS NULL OR NEW.verification_token = '' THEN
    NEW.verification_token := generate_domain_verification_token();
  END IF;
  RETURN NEW;
END;
$$;

-- Update invitation token function  
CREATE OR REPLACE FUNCTION public.set_invitation_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$;

-- Update link token function
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

-- Update tracking ID function
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

-- Update notification functions
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