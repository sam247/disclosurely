-- Create report-attachments storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-attachments',
  'report-attachments',
  false,
  20971520, -- 20MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

-- Allow anonymous users to upload files during report submission
-- They can only upload to their own tracking_id folder
CREATE POLICY "Allow anonymous file uploads for reports"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'report-attachments'
);

-- Allow authenticated org members to view their organization's attachments
CREATE POLICY "Org members can view their attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments'
  AND EXISTS (
    SELECT 1 FROM report_attachments ra
    JOIN reports r ON ra.report_id = r.id
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE ra.filename = storage.objects.name
      AND p.id = auth.uid()
      AND p.is_active = true
  )
);

-- Allow authenticated org members to delete their organization's attachments
CREATE POLICY "Org members can delete their attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-attachments'
  AND EXISTS (
    SELECT 1 FROM report_attachments ra
    JOIN reports r ON ra.report_id = r.id
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE ra.filename = storage.objects.name
      AND p.id = auth.uid()
      AND p.is_active = true
  )
);