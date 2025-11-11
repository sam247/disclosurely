-- Create user_sessions table to track active user sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Supabase session ID
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  device_name TEXT, -- e.g., 'iPhone 14', 'Chrome on Windows'
  browser TEXT, -- Browser name
  os TEXT, -- Operating system
  ip_address INET, -- IP address
  location_city TEXT, -- City from IP geolocation
  location_country TEXT, -- Country from IP geolocation
  location_lat DECIMAL(10, 8), -- Latitude
  location_lng DECIMAL(11, 8), -- Longitude
  user_agent TEXT, -- Full user agent string
  is_active BOOLEAN DEFAULT TRUE, -- Whether this session is currently active
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Session expiration time
  
  -- Constraints
  UNIQUE(user_id, session_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity_at);

-- RLS Policies
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all sessions (for edge functions)
CREATE POLICY "Service role can manage all sessions"
  ON public.user_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to get active session count for a user
CREATE OR REPLACE FUNCTION get_active_session_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_sessions
  WHERE user_id = p_user_id
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to deactivate all other sessions for a user (except current)
CREATE OR REPLACE FUNCTION deactivate_other_sessions(
  p_user_id UUID,
  p_current_session_id TEXT
)
RETURNS INTEGER AS $$
  UPDATE public.user_sessions
  SET is_active = FALSE,
      last_activity_at = NOW()
  WHERE user_id = p_user_id
    AND session_id != p_current_session_id
    AND is_active = TRUE;
  
  SELECT COUNT(*)::INTEGER FROM public.user_sessions
  WHERE user_id = p_user_id
    AND session_id != p_current_session_id
    AND is_active = FALSE;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to deactivate all sessions for a user
CREATE OR REPLACE FUNCTION deactivate_all_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
  UPDATE public.user_sessions
  SET is_active = FALSE,
      last_activity_at = NOW()
  WHERE user_id = p_user_id
    AND is_active = TRUE;
  
  SELECT COUNT(*)::INTEGER FROM public.user_sessions
  WHERE user_id = p_user_id
    AND is_active = FALSE;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(
  p_user_id UUID,
  p_session_id TEXT
)
RETURNS VOID AS $$
  UPDATE public.user_sessions
  SET last_activity_at = NOW()
  WHERE user_id = p_user_id
    AND session_id = p_session_id
    AND is_active = TRUE;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Trigger to clean up expired sessions (runs periodically via cron or on access)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS VOID AS $$
  UPDATE public.user_sessions
  SET is_active = FALSE
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = TRUE;
$$ LANGUAGE SQL SECURITY DEFINER;

