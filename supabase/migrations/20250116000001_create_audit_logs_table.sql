-- Create audit_logs table with comprehensive schema for tamper-evident logging
-- This table captures all meaningful actions across the system

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Core event information
  event_type text NOT NULL, -- e.g., 'user.login', 'case.created', 'case.updated'
  category text NOT NULL, -- e.g., 'authentication', 'case_management', 'user_management'
  action text NOT NULL, -- e.g., 'create', 'update', 'delete', 'login', 'logout'
  severity text NOT NULL DEFAULT 'info', -- 'low', 'medium', 'high', 'critical'
  
  -- Actor information
  actor_type text NOT NULL, -- 'user', 'system', 'api', 'webhook'
  actor_id uuid, -- user_id or system identifier
  actor_email text, -- for user actions
  actor_ip_address inet,
  actor_user_agent text,
  actor_session_id text,
  
  -- Target information
  target_type text, -- 'case', 'user', 'organization', 'policy', etc.
  target_id uuid, -- ID of the affected entity
  target_name text, -- Human-readable name of target
  
  -- Event details
  summary text NOT NULL, -- Short description of what happened
  description text, -- Detailed description
  metadata jsonb DEFAULT '{}', -- Additional structured data
  
  -- Before/after state for changes
  before_state jsonb, -- State before the action
  after_state jsonb, -- State after the action
  
  -- Request context
  request_id text, -- Unique request identifier
  request_method text, -- HTTP method if applicable
  request_path text, -- API endpoint or page path
  request_params jsonb, -- Query parameters or form data
  
  -- Geographic and technical context
  geo_country text,
  geo_region text,
  geo_city text,
  
  -- Tamper evidence
  hash text NOT NULL, -- SHA-256 hash of this record
  previous_hash text, -- Hash of previous record in chain
  chain_index bigint NOT NULL DEFAULT 0, -- Position in hash chain
  
  -- Organization context
  organization_id uuid NOT NULL,
  
  -- Retention and archival
  retention_until timestamp with time zone, -- When this record can be archived
  archived_at timestamp with time zone, -- When it was moved to archive
  archive_location text, -- Where archived data is stored
  
  -- Constraints
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles (id) ON DELETE SET NULL,
  CONSTRAINT audit_logs_event_type_check CHECK (event_type ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$'),
  CONSTRAINT audit_logs_category_check CHECK (category IN ('authentication', 'case_management', 'user_management', 'organization_management', 'billing', 'api_access', 'system', 'security', 'compliance')),
  CONSTRAINT audit_logs_action_check CHECK (action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject', 'archive', 'restore', 'invite', 'revoke')),
  CONSTRAINT audit_logs_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT audit_logs_actor_type_check CHECK (actor_type IN ('user', 'system', 'api', 'webhook', 'scheduled_job'))
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_organization_id ON public.audit_logs (organization_id);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs (actor_id);
CREATE INDEX idx_audit_logs_target_type_id ON public.audit_logs (target_type, target_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs (event_type);
CREATE INDEX idx_audit_logs_category ON public.audit_logs (category);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs (severity);
CREATE INDEX idx_audit_logs_hash ON public.audit_logs (hash);
CREATE INDEX idx_audit_logs_chain_index ON public.audit_logs (chain_index);
CREATE INDEX idx_audit_logs_retention_until ON public.audit_logs (retention_until);

-- Create composite indexes for common queries
CREATE INDEX idx_audit_logs_org_created ON public.audit_logs (organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor_created ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_target_created ON public.audit_logs (target_type, target_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Organizations can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE organization_id = audit_logs.organization_id
  ));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- System inserts are allowed

CREATE POLICY "Only system can update audit logs"
  ON public.audit_logs FOR UPDATE
  USING (false); -- No updates allowed - append only

CREATE POLICY "No deletes allowed on audit logs"
  ON public.audit_logs FOR DELETE
  USING (false); -- No deletes allowed - tamper evident

-- Create function to calculate hash for tamper evidence
CREATE OR REPLACE FUNCTION public.calculate_audit_hash(
  p_id uuid,
  p_created_at timestamp with time zone,
  p_event_type text,
  p_category text,
  p_action text,
  p_actor_type text,
  p_actor_id uuid,
  p_target_type text,
  p_target_id uuid,
  p_summary text,
  p_metadata jsonb,
  p_before_state jsonb,
  p_after_state jsonb,
  p_organization_id uuid,
  p_previous_hash text
) RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(
    digest(
      p_id::text || 
      p_created_at::text || 
      p_event_type || 
      p_category || 
      p_action || 
      p_actor_type || 
      COALESCE(p_actor_id::text, '') || 
      COALESCE(p_target_type, '') || 
      COALESCE(p_target_id::text, '') || 
      p_summary || 
      COALESCE(p_metadata::text, '{}') || 
      COALESCE(p_before_state::text, '') || 
      COALESCE(p_after_state::text, '') || 
      p_organization_id::text || 
      COALESCE(p_previous_hash, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$;

-- Create function to get the latest hash for chain continuity
CREATE OR REPLACE FUNCTION public.get_latest_audit_hash(p_organization_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  latest_hash text;
BEGIN
  SELECT hash INTO latest_hash
  FROM public.audit_logs
  WHERE organization_id = p_organization_id
  ORDER BY created_at DESC, chain_index DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_hash, '');
END;
$$;

-- Create function to get the next chain index
CREATE OR REPLACE FUNCTION public.get_next_chain_index(p_organization_id uuid)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  next_index bigint;
BEGIN
  SELECT COALESCE(MAX(chain_index), 0) + 1 INTO next_index
  FROM public.audit_logs
  WHERE organization_id = p_organization_id;
  
  RETURN next_index;
END;
$$;

-- Create trigger to automatically calculate hash and chain index
CREATE OR REPLACE FUNCTION public.audit_logs_hash_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  prev_hash text;
  next_index bigint;
BEGIN
  -- Get previous hash and next chain index
  prev_hash := public.get_latest_audit_hash(NEW.organization_id);
  next_index := public.get_next_chain_index(NEW.organization_id);
  
  -- Set chain index
  NEW.chain_index := next_index;
  
  -- Calculate hash
  NEW.hash := public.calculate_audit_hash(
    NEW.id,
    NEW.created_at,
    NEW.event_type,
    NEW.category,
    NEW.action,
    NEW.actor_type,
    NEW.actor_id,
    NEW.target_type,
    NEW.target_id,
    NEW.summary,
    NEW.metadata,
    NEW.before_state,
    NEW.after_state,
    NEW.organization_id,
    prev_hash
  );
  
  -- Set retention period (default 7 years)
  NEW.retention_until := NEW.created_at + INTERVAL '7 years';
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_logs_hash_trigger
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_logs_hash_trigger();

-- Create function to verify audit chain integrity
CREATE OR REPLACE FUNCTION public.verify_audit_chain(p_organization_id uuid)
RETURNS TABLE(
  is_valid boolean,
  total_records bigint,
  invalid_records bigint,
  first_invalid_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
DECLARE
  rec RECORD;
  prev_hash text := '';
  invalid_count bigint := 0;
  first_invalid timestamp with time zone;
  total_count bigint;
BEGIN
  -- Count total records
  SELECT COUNT(*) INTO total_count
  FROM public.audit_logs
  WHERE organization_id = p_organization_id;
  
  -- Check each record in chain order
  FOR rec IN 
    SELECT id, created_at, hash, previous_hash, chain_index
    FROM public.audit_logs
    WHERE organization_id = p_organization_id
    ORDER BY chain_index
  LOOP
    -- Verify hash matches
    IF rec.hash != public.calculate_audit_hash(
      rec.id,
      rec.created_at,
      (SELECT event_type FROM public.audit_logs WHERE id = rec.id),
      (SELECT category FROM public.audit_logs WHERE id = rec.id),
      (SELECT action FROM public.audit_logs WHERE id = rec.id),
      (SELECT actor_type FROM public.audit_logs WHERE id = rec.id),
      (SELECT actor_id FROM public.audit_logs WHERE id = rec.id),
      (SELECT target_type FROM public.audit_logs WHERE id = rec.id),
      (SELECT target_id FROM public.audit_logs WHERE id = rec.id),
      (SELECT summary FROM public.audit_logs WHERE id = rec.id),
      (SELECT metadata FROM public.audit_logs WHERE id = rec.id),
      (SELECT before_state FROM public.audit_logs WHERE id = rec.id),
      (SELECT after_state FROM public.audit_logs WHERE id = rec.id),
      p_organization_id,
      prev_hash
    ) THEN
      invalid_count := invalid_count + 1;
      IF first_invalid IS NULL THEN
        first_invalid := rec.created_at;
      END IF;
    END IF;
    
    prev_hash := rec.hash;
  END LOOP;
  
  RETURN QUERY SELECT 
    (invalid_count = 0) as is_valid,
    total_count,
    invalid_count,
    first_invalid;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_audit_hash TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_audit_hash TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_chain_index TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_audit_chain TO authenticated;
