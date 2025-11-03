-- Fix 1: Add search_path protection to get_user_role function
ALTER FUNCTION get_user_role(uuid) SET search_path = public;

-- Fix 2: Restrict report-attachments bucket uploads to authenticated users only
DROP POLICY IF EXISTS "Allow report attachment uploads to storage" ON storage.objects;

-- Create new secure policy for authenticated uploads
CREATE POLICY "Authenticated users can upload report attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-attachments' AND
  -- Verify user is in an active organization
  auth.uid() IN (
    SELECT id FROM profiles WHERE organization_id IS NOT NULL AND is_active = true
  )
);

-- Create policy for anonymous submissions via validated links (server-side only)
-- This will be enforced through edge functions, not direct RLS
CREATE POLICY "Service role can upload anonymous report attachments"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'report-attachments');