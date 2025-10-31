-- Security Hardening: Fix SECURITY DEFINER and search_path issues
-- Addresses Lovable Security Scan findings

-- Fix SECURITY DEFINER function: mark_reminder_sent
-- Add SET search_path to prevent schema poisoning
DROP FUNCTION IF EXISTS public.mark_reminder_sent(UUID);

CREATE OR REPLACE FUNCTION public.mark_reminder_sent(assignment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.policy_assignments
  SET 
    reminder_sent_at = NOW(),
    updated_at = NOW()
  WHERE id = assignment_id;
END;
$$;

COMMENT ON FUNCTION public.mark_reminder_sent IS 'Marks when a policy assignment reminder was sent (SECURITY DEFINER with search_path set)';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.mark_reminder_sent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_reminder_sent(UUID) TO service_role;

-- Review and document all SECURITY DEFINER usage
-- Note: SECURITY DEFINER views should be avoided when possible
-- Consider converting to regular views with proper RLS policies instead

