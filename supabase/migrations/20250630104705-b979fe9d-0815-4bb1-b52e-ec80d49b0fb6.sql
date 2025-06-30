
-- Fix RLS policies for report_attachments to allow anonymous file uploads
DROP POLICY IF EXISTS "Users can manage their own report attachments" ON public.report_attachments;
DROP POLICY IF EXISTS "Organization members can view report attachments" ON public.report_attachments;

-- Allow anyone to insert report attachments (for whistleblower uploads)
CREATE POLICY "Allow report attachment uploads"
ON public.report_attachments FOR INSERT
WITH CHECK (true);

-- Allow organization members to view report attachments for their organization's reports
CREATE POLICY "Organization members can view report attachments"
ON public.report_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.profiles p ON p.organization_id = r.organization_id
    WHERE r.id = report_attachments.report_id
    AND p.id = auth.uid()
    AND p.is_active = true
  )
);

-- Allow organization members to update/delete report attachments for their organization's reports
CREATE POLICY "Organization members can manage report attachments"
ON public.report_attachments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.profiles p ON p.organization_id = r.organization_id
    WHERE r.id = report_attachments.report_id
    AND p.id = auth.uid()
    AND p.is_active = true
  )
);

-- Update storage policies to be more permissive for uploads
DROP POLICY IF EXISTS "Allow authenticated users to upload report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow organization members to access their report attachments" ON storage.objects;

-- Allow anyone to upload to report-attachments bucket
CREATE POLICY "Allow report attachment uploads to storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-attachments');

-- Allow organization members to access files for their reports
CREATE POLICY "Organization members can access report files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments' AND
  EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.profiles p ON p.organization_id = r.organization_id
    WHERE r.tracking_id = split_part(name, '/', 1)
    AND p.id = auth.uid()
    AND p.is_active = true
  )
);

-- Allow organization members to manage files for their reports
CREATE POLICY "Organization members can manage report files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'report-attachments' AND
  EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.profiles p ON p.organization_id = r.organization_id
    WHERE r.tracking_id = split_part(name, '/', 1)
    AND p.id = auth.uid()
    AND p.is_active = true
  )
);
