-- Fix 1: Add search_path protection to get_user_role function
ALTER FUNCTION get_user_role(uuid) SET search_path = public;

-- Fix 2: Secure report-attachments bucket uploads
-- Drop any existing insecure policies
DROP POLICY IF EXISTS "Allow report attachment uploads to storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload anonymous report attachments" ON storage.objects;

-- Create new secure policy for authenticated uploads only
CREATE POLICY "Secure authenticated report attachment uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-attachments' AND
  -- Verify user is in an active organization
  auth.uid() IN (
    SELECT id FROM profiles WHERE organization_id IS NOT NULL AND is_active = true
  )
);

-- Service role policy for anonymous submissions (enforced via edge functions)
CREATE POLICY "Service role report attachments"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'report-attachments');