-- Fix RLS policies for report_drafts table
-- SECURITY FIX: Remove overly permissive policies that allow anyone to read/update/delete ANY draft

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Anyone can read drafts with code" ON public.report_drafts;
DROP POLICY IF EXISTS "Anyone can update drafts" ON public.report_drafts;
DROP POLICY IF EXISTS "Anyone can delete drafts" ON public.report_drafts;

-- Keep the INSERT policy (anyone can create drafts anonymously)
-- This is safe because it only allows creation, not reading others' drafts

-- Create restrictive policies that will force operations through edge functions
-- Edge functions will use service role to bypass RLS and verify draft_code server-side

-- Allow service role to read all drafts (for edge functions)
CREATE POLICY "Service role can read all drafts"
  ON public.report_drafts
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to update all drafts (for edge functions)
CREATE POLICY "Service role can update all drafts"
  ON public.report_drafts
  FOR UPDATE
  TO service_role
  USING (true);

-- Allow service role to delete all drafts (for edge functions)
CREATE POLICY "Service role can delete all drafts"
  ON public.report_drafts
  FOR DELETE
  TO service_role
  USING (true);

-- Add comment explaining the security model
COMMENT ON TABLE public.report_drafts IS 'Temporary storage for incomplete whistleblower reports. All operations (except INSERT) must go through edge functions that verify draft_code. Direct client access is blocked by RLS.';
