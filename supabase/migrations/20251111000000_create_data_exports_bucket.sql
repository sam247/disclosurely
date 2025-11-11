-- Create data-exports storage bucket for GDPR data exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-exports',
  'data-exports',
  false,
  10485760, -- 10MB limit
  ARRAY['application/json']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/json'];

-- Allow service role to upload exports
CREATE POLICY "Service role can upload exports" ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'data-exports');

-- Allow service role to read exports
CREATE POLICY "Service role can read exports" ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'data-exports');

-- Allow service role to delete exports
CREATE POLICY "Service role can delete exports" ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'data-exports');

