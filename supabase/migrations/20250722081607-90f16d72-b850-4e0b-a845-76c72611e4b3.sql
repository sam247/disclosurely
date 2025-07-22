-- Create table for storing AI case analyses
CREATE TABLE public.ai_case_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  case_id UUID NOT NULL,
  case_title TEXT NOT NULL,
  tracking_id TEXT NOT NULL,
  analysis_content TEXT NOT NULL,
  document_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing AI helper documents
CREATE TABLE public.ai_helper_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_case_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_helper_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_case_analyses
CREATE POLICY "Users can view analyses in their organization" 
ON public.ai_case_analyses 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true
));

CREATE POLICY "Users can create analyses in their organization" 
ON public.ai_case_analyses 
FOR INSERT 
WITH CHECK (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true
) AND created_by = auth.uid());

CREATE POLICY "Users can update their own analyses" 
ON public.ai_case_analyses 
FOR UPDATE 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true
) AND created_by = auth.uid());

CREATE POLICY "Users can delete their own analyses" 
ON public.ai_case_analyses 
FOR DELETE 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true
) AND created_by = auth.uid());

-- Create policies for ai_helper_documents
CREATE POLICY "Users can view documents in their organization" 
ON public.ai_helper_documents 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true
));

CREATE POLICY "Users can upload documents in their organization" 
ON public.ai_helper_documents 
FOR INSERT 
WITH CHECK (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true
) AND uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own documents" 
ON public.ai_helper_documents 
FOR DELETE 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true
) AND uploaded_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ai_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_analyses_updated_at
BEFORE UPDATE ON public.ai_case_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_analysis_updated_at();