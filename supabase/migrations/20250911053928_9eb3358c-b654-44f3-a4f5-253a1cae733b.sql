-- Create storage bucket for AI helper documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ai-helper-docs', 'ai-helper-docs', false);

-- Create RLS policies for ai-helper-docs bucket
CREATE POLICY "Organization members can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ai-helper-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_active = true
  )
);

CREATE POLICY "Organization members can view their organization's documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ai-helper-docs' 
  AND EXISTS (
    SELECT 1 FROM ai_helper_documents ahd
    JOIN profiles p ON p.organization_id = ahd.organization_id
    WHERE ahd.file_path = name 
    AND p.id = auth.uid() 
    AND p.is_active = true
  )
);

CREATE POLICY "Organization members can delete their organization's documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'ai-helper-docs' 
  AND EXISTS (
    SELECT 1 FROM ai_helper_documents ahd
    JOIN profiles p ON p.organization_id = ahd.organization_id
    WHERE ahd.file_path = name 
    AND p.id = auth.uid() 
    AND p.is_active = true
  )
);

CREATE POLICY "Users can update their organization's documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'ai-helper-docs' 
  AND EXISTS (
    SELECT 1 FROM ai_helper_documents ahd
    JOIN profiles p ON p.organization_id = ahd.organization_id
    WHERE ahd.file_path = name 
    AND p.id = auth.uid() 
    AND p.is_active = true
  )
);