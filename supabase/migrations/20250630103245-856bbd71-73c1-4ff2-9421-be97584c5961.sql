
-- Create storage bucket for report attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-attachments', 'report-attachments', false);

-- Create RLS policies for the report-attachments bucket
CREATE POLICY "Allow authenticated users to upload report attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'report-attachments');

CREATE POLICY "Allow organization members to access their report attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments' AND
  EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.profiles p ON p.organization_id = r.organization_id
    WHERE r.tracking_id = (storage.foldername(name))[1]
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to update report attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'report-attachments');

CREATE POLICY "Allow authenticated users to delete report attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'report-attachments');

-- Add file upload capability to existing report_attachments table
-- The table already exists, so we just need to ensure it has the right structure
ALTER TABLE public.report_attachments 
ADD COLUMN IF NOT EXISTS original_filename TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by_whistleblower BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_report_attachments_report_id ON public.report_attachments(report_id);
