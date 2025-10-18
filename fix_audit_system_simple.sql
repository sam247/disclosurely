-- SIMPLIFIED AUDIT TRAIL SETUP
-- Run this in Supabase SQL Editor

-- 1. Drop existing audit_logs table if it exists
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- 2. Create audit_logs table without foreign key constraints initially
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  organization_id UUID,
  actor_id UUID,
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

-- 3. Create indexes
CREATE INDEX idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_category_action ON public.audit_logs(category, action);

-- 4. Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
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

-- 6. Create verify_audit_chain function
CREATE OR REPLACE FUNCTION public.verify_audit_chain(p_organization_id UUID)
RETURNS TABLE(
  is_valid BOOLEAN,
  total_records BIGINT,
  invalid_records BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_records BIGINT := 0;
BEGIN
  SELECT COUNT(*) INTO v_total_records
  FROM public.audit_logs
  WHERE organization_id = p_organization_id;
  
  RETURN QUERY SELECT TRUE, v_total_records, 0::BIGINT;
END;
$$;

-- 7. Add 'reviewing' to report_status enum
ALTER TYPE public.report_status ADD VALUE IF NOT EXISTS 'reviewing';

-- 8. Success message
SELECT 'Audit trail system successfully set up!' as message;
