-- Clean up old implementations
DROP FUNCTION IF EXISTS public.log_login_attempt(text, text, text, boolean, text);
DROP FUNCTION IF EXISTS public.record_login_attempt(text, boolean, inet, text, uuid);
DROP FUNCTION IF EXISTS public.is_account_locked(text, uuid);
DROP TABLE IF EXISTS public.login_attempts CASCADE;
DROP TABLE IF EXISTS public.lockout_settings CASCADE;

-- Create login attempts tracking table
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempted_at DESC);

-- Create lockout settings table
CREATE TABLE public.lockout_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  lockout_duration_minutes INTEGER NOT NULL DEFAULT 15,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lockout_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "System can insert login attempts" ON public.login_attempts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can view login attempts" ON public.login_attempts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'org_admin') AND ur.is_active = true));
CREATE POLICY "Org admins can manage lockout settings" ON public.lockout_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'org_admin') AND ur.is_active = true));

-- Create functions
CREATE FUNCTION public.record_login_attempt(p_email TEXT, p_success BOOLEAN, p_ip_address INET DEFAULT NULL, p_user_agent TEXT DEFAULT NULL, p_organization_id UUID DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN 
  INSERT INTO public.login_attempts (email, success, ip_address, user_agent, organization_id) 
  VALUES (p_email, p_success, p_ip_address, p_user_agent, p_organization_id);
  DELETE FROM public.login_attempts WHERE attempted_at < now() - INTERVAL '24 hours'; 
END; $$;

CREATE FUNCTION public.is_account_locked(p_email TEXT, p_organization_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_max_attempts INTEGER := 5; v_lockout_minutes INTEGER := 15; v_enabled BOOLEAN := true; v_failed_attempts INTEGER;
BEGIN 
  SELECT COALESCE(max_attempts, 5), COALESCE(lockout_duration_minutes, 15), COALESCE(enabled, true) INTO v_max_attempts, v_lockout_minutes, v_enabled
  FROM public.lockout_settings WHERE organization_id = p_organization_id LIMIT 1;
  IF NOT v_enabled THEN RETURN false; END IF;
  SELECT COUNT(*) INTO v_failed_attempts FROM public.login_attempts WHERE email = p_email AND success = false AND attempted_at > now() - (v_lockout_minutes || ' minutes')::INTERVAL;
  RETURN v_failed_attempts >= v_max_attempts;
END; $$;