-- Apply the audit_logs table migration manually
-- This will create the table if it doesn't exist

-- First, drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Create the audit_logs table
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Core event information
  event_type text NOT NULL,
  category text NOT NULL,
  action text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  
  -- Actor information
  actor_type text NOT NULL,
  actor_id uuid,
  actor_email text,
  actor_ip_address inet,
  actor_user_agent text,
  actor_session_id text,
  
  -- Target information
  target_type text,
  target_id uuid,
  target_name text,
  
  -- Event details
  summary text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  
  -- Before/after state for changes
  before_state jsonb,
  after_state jsonb,
  
  -- Request context
  request_id text,
  request_method text,
  request_path text,
  request_params jsonb,
  
  -- Geographic and technical context
  geo_country text,
  geo_region text,
  geo_city text,
  
  -- Tamper evidence
  hash text NOT NULL,
  previous_hash text,
  chain_index bigint NOT NULL DEFAULT 0,
  
  -- Organization context
  organization_id uuid NOT NULL,
  
  -- Retention and archival
  retention_until timestamp with time zone,
  archived_at timestamp with time zone,
  archive_location text,
  
  -- Constraints
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles (id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_organization_id ON public.audit_logs (organization_id);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs (actor_id);
CREATE INDEX idx_audit_logs_target_type_id ON public.audit_logs (target_type, target_id);

-- Enable RLS
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
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;

-- Check current user first
SELECT auth.uid() as current_user_id;

-- Check if user exists in profiles
SELECT id, organization_id, email 
FROM public.profiles 
WHERE id = auth.uid();

-- Test insert with hardcoded organization_id (use your actual org ID)
INSERT INTO public.audit_logs (
  event_type,
  category,
  action,
  severity,
  actor_type,
  actor_id,
  actor_email,
  target_type,
  target_id,
  target_name,
  summary,
  organization_id,
  hash,
  chain_index
) VALUES (
  'test.event',
  'system',
  'create',
  'low',
  'system',
  '8bd9b4a0-8cf3-49d0-87e3-2e709be5e77f', -- Your user ID from console logs
  'sam@betterranking.co.uk',
  'test',
  gen_random_uuid(),
  'Test Entry',
  'Test audit log entry',
  '0358e286-699a-43d7-b8ea-6d33c269af5e', -- Your organization ID from console logs
  'test_hash',
  1
);

-- Verify it was inserted
SELECT COUNT(*) as total_records
FROM public.audit_logs 
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e';
