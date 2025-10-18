-- Fix audit_logs hash column issue
-- Run this in Supabase SQL Editor

-- First, let's check the current table structure
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Create a function to generate hash for audit logs
CREATE OR REPLACE FUNCTION public.generate_audit_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate hash from the audit log data
  -- Use a combination of timestamp, organization_id, and event data
  IF NEW.hash IS NULL OR NEW.hash = '' THEN
    NEW.hash := encode(
      digest(
        COALESCE(NEW.created_at::text, '') || 
        COALESCE(NEW.organization_id::text, '') || 
        COALESCE(NEW.event_type, '') || 
        COALESCE(NEW.category, '') || 
        COALESCE(NEW.action, '') || 
        COALESCE(NEW.actor_id::text, '') || 
        COALESCE(NEW.target_id::text, '') || 
        COALESCE(NEW.summary, '') || 
        COALESCE(NEW.metadata::text, '') || 
        COALESCE(NEW.chain_index::text, ''),
        'sha256'
      ), 
      'hex'
    );
  END IF;
  
  -- Set chain_index if not provided
  IF NEW.chain_index IS NULL OR NEW.chain_index = 0 THEN
    SELECT COALESCE(MAX(chain_index), 0) + 1 
    INTO NEW.chain_index 
    FROM public.audit_logs 
    WHERE organization_id = NEW.organization_id;
  END IF;
  
  -- Set previous_hash if not provided
  IF NEW.previous_hash IS NULL THEN
    SELECT hash 
    INTO NEW.previous_hash 
    FROM public.audit_logs 
    WHERE organization_id = NEW.organization_id 
    ORDER BY created_at DESC, chain_index DESC 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_generate_audit_hash ON public.audit_logs;
CREATE TRIGGER trg_generate_audit_hash
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_audit_hash();

-- Also fix the RLS policies while we're at it
DROP POLICY IF EXISTS "Organization members can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Organization members can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow audit log viewing for organization members" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow audit log insertion for authenticated users" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow all authenticated users to view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow all authenticated users to insert audit logs" ON public.audit_logs;

-- Create working RLS policies
CREATE POLICY "Allow authenticated users to view audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Success message
SELECT 'Audit logs hash generation trigger created successfully!' as message;
