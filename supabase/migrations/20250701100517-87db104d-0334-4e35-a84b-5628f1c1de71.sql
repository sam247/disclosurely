
-- Create audit_logs table for comprehensive security event tracking
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- authentication, authorization, data_access, configuration, security
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT, -- table name, file, etc.
  resource_id TEXT, -- specific record ID
  action TEXT NOT NULL, -- login, logout, create, update, delete, access, etc.
  result TEXT NOT NULL CHECK (result IN ('success', 'failure')), -- success or failure
  details JSONB DEFAULT '{}',
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security_alerts table for active security incidents
CREATE TABLE public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- failed_login, suspicious_activity, data_breach, etc.
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_risk_level ON public.audit_logs(risk_level);
CREATE INDEX idx_security_alerts_resolved ON public.security_alerts(resolved);
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at);

-- Enable RLS on both tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit_logs (only authenticated users can view)
CREATE POLICY "Authenticated users can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for security_alerts (only authenticated users can view/manage)
CREATE POLICY "Authenticated users can view security alerts" 
  ON public.security_alerts 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "System can create security alerts" 
  ON public.security_alerts 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can resolve security alerts" 
  ON public.security_alerts 
  FOR UPDATE 
  TO authenticated
  USING (true);
