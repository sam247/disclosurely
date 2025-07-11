-- Enhance security settings for authentication
-- Shorten JWT lifetime to 15 minutes for better security

-- Update auth config (this would need to be done in Supabase dashboard)
-- JWT expiry: 900 seconds (15 minutes)
-- Refresh token rotation: enabled

-- Create audit log for failed login attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on login attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view login attempts
CREATE POLICY "Admins can view login attempts" 
  ON public.login_attempts 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Policy to allow system to insert login attempts
CREATE POLICY "System can insert login attempts" 
  ON public.login_attempts 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to log failed login attempts
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_success BOOLEAN,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.login_attempts (
    email, 
    ip_address, 
    user_agent, 
    success, 
    failure_reason
  ) VALUES (
    p_email,
    p_ip_address::inet,
    p_user_agent,
    p_success,
    p_failure_reason
  );
END;
$$;

-- Create security event tracking
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own security events
CREATE POLICY "Users can view their own security events" 
  ON public.security_events 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- Policy for org admins to view organization security events
CREATE POLICY "Org admins can view organization security events" 
  ON public.security_events 
  FOR SELECT 
  TO authenticated 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'org_admin') 
      AND is_active = true
    )
  );

-- Policy to allow system to insert security events
CREATE POLICY "System can insert security events" 
  ON public.security_events 
  FOR INSERT 
  WITH CHECK (true);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'low'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type, 
    user_id, 
    organization_id, 
    details, 
    ip_address, 
    user_agent, 
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_organization_id,
    p_details,
    CASE WHEN p_ip_address IS NOT NULL THEN p_ip_address::inet ELSE NULL END,
    p_user_agent,
    p_severity
  );
END;
$$;