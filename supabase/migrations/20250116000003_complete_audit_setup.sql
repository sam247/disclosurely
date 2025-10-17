-- Comprehensive Audit Trail Database Setup
-- Run this script in your Supabase SQL Editor to set up the complete audit system

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_type TEXT NOT NULL DEFAULT 'user',
  event_type TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  target_type TEXT,
  target_id UUID,
  target_name TEXT,
  summary TEXT,
  description TEXT,
  before_state JSONB,
  after_state JSONB,
  changes JSONB,
  request_context JSONB,
  metadata JSONB,
  hash TEXT NOT NULL,
  previous_hash TEXT,
  chain_index BIGINT NOT NULL DEFAULT 0
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category_action ON public.audit_logs(category, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash ON public.audit_logs(hash);

-- 3. Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Organization members can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.id
      FROM public.profiles p
      WHERE p.organization_id = audit_logs.organization_id
    )
  );

CREATE POLICY "Organization members can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT p.id
      FROM public.profiles p
      WHERE p.organization_id = audit_logs.organization_id
    )
  );

-- 5. Update report_status enum to include 'reviewing'
-- First update any existing records
UPDATE public.reports 
SET status = 'reviewing'::report_status 
WHERE status = 'in_review'::report_status;

-- Add the new enum value
ALTER TYPE public.report_status ADD VALUE IF NOT EXISTS 'reviewing';

-- 6. Create hash calculation function
CREATE OR REPLACE FUNCTION calculate_audit_hash(
  p_data JSONB,
  p_previous_hash TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  data_string TEXT;
  input_string TEXT;
BEGIN
  data_string := p_data::TEXT;
  input_string := COALESCE(p_previous_hash, '') || data_string;
  
  RETURN encode(digest(input_string, 'sha256'), 'hex');
END;
$$;

-- 7. Create audit chain verification function
CREATE OR REPLACE FUNCTION verify_audit_chain(p_organization_id UUID)
RETURNS TABLE(
  is_valid BOOLEAN,
  total_records BIGINT,
  invalid_records BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count BIGINT;
  invalid_count BIGINT;
  current_hash TEXT;
  prev_hash TEXT;
  calculated_hash TEXT;
  rec RECORD;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM public.audit_logs
  WHERE organization_id = p_organization_id;
  
  -- If no records, chain is valid
  IF total_count = 0 THEN
    RETURN QUERY SELECT TRUE, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Check chain integrity
  invalid_count := 0;
  
  FOR rec IN 
    SELECT id, hash, previous_hash, 
           jsonb_build_object(
             'id', id,
             'created_at', created_at,
             'organization_id', organization_id,
             'actor_id', actor_id,
             'actor_email', actor_email,
             'actor_type', actor_type,
             'event_type', event_type,
             'category', category,
             'action', action,
             'severity', severity,
             'target_type', target_type,
             'target_id', target_id,
             'target_name', target_name,
             'summary', summary,
             'description', description,
             'before_state', before_state,
             'after_state', after_state,
             'changes', changes,
             'request_context', request_context,
             'metadata', metadata,
             'chain_index', chain_index
           ) as data
    FROM public.audit_logs
    WHERE organization_id = p_organization_id
    ORDER BY chain_index ASC
  LOOP
    -- Calculate expected hash
    calculated_hash := calculate_audit_hash(rec.data, rec.previous_hash);
    
    -- Check if hash matches
    IF rec.hash != calculated_hash THEN
      invalid_count := invalid_count + 1;
    END IF;
    
    prev_hash := rec.hash;
  END LOOP;
  
  RETURN QUERY SELECT (invalid_count = 0), total_count, invalid_count;
END;
$$;

-- 8. Create trigger function for automatic hash calculation
CREATE OR REPLACE FUNCTION set_audit_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prev_hash TEXT;
  chain_idx BIGINT;
  event_data JSONB;
BEGIN
  -- Get previous hash and chain index
  SELECT hash, chain_index INTO prev_hash, chain_idx
  FROM public.audit_logs
  WHERE organization_id = NEW.organization_id
  ORDER BY chain_index DESC
  LIMIT 1;
  
  -- Set chain index
  NEW.chain_index := COALESCE(chain_idx, 0) + 1;
  
  -- Build event data for hashing
  event_data := jsonb_build_object(
    'id', NEW.id,
    'created_at', NEW.created_at,
    'organization_id', NEW.organization_id,
    'actor_id', NEW.actor_id,
    'actor_email', NEW.actor_email,
    'actor_type', NEW.actor_type,
    'event_type', NEW.event_type,
    'category', NEW.category,
    'action', NEW.action,
    'severity', NEW.severity,
    'target_type', NEW.target_type,
    'target_id', NEW.target_id,
    'target_name', NEW.target_name,
    'summary', NEW.summary,
    'description', NEW.description,
    'before_state', NEW.before_state,
    'after_state', NEW.after_state,
    'changes', NEW.changes,
    'request_context', NEW.request_context,
    'metadata', NEW.metadata,
    'chain_index', NEW.chain_index
  );
  
  -- Calculate hash
  NEW.hash := calculate_audit_hash(event_data, prev_hash);
  NEW.previous_hash := prev_hash;
  
  RETURN NEW;
END;
$$;

-- 9. Create trigger
DROP TRIGGER IF EXISTS trigger_set_audit_hash ON public.audit_logs;
CREATE TRIGGER trigger_set_audit_hash
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_audit_hash();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_audit_hash TO authenticated;
GRANT EXECUTE ON FUNCTION verify_audit_chain TO authenticated;

-- Success message
SELECT 'Audit trail system successfully set up!' as message;
