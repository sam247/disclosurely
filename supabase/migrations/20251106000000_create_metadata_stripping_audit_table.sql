-- Create metadata_stripping_audit table for tracking metadata removal operations
-- This is critical for security auditing and compliance

CREATE TABLE IF NOT EXISTS public.metadata_stripping_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  original_size BIGINT NOT NULL,
  cleaned_size BIGINT NOT NULL,
  metadata_found BOOLEAN NOT NULL DEFAULT false,
  stripped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_metadata_stripping_audit_user_id ON public.metadata_stripping_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_metadata_stripping_audit_report_id ON public.metadata_stripping_audit(report_id);
CREATE INDEX IF NOT EXISTS idx_metadata_stripping_audit_stripped_at ON public.metadata_stripping_audit(stripped_at);
CREATE INDEX IF NOT EXISTS idx_metadata_stripping_audit_file_type ON public.metadata_stripping_audit(file_type);

-- Enable RLS
ALTER TABLE public.metadata_stripping_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service role can insert/select (edge functions use service role)
CREATE POLICY "Service role can insert metadata stripping audit"
  ON public.metadata_stripping_audit
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can select metadata stripping audit"
  ON public.metadata_stripping_audit
  FOR SELECT
  TO service_role
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.metadata_stripping_audit IS 'Audit log for metadata stripping operations. Tracks what metadata was removed from files to protect whistleblower anonymity.';
COMMENT ON COLUMN public.metadata_stripping_audit.metadata_found IS 'Whether metadata was actually found and removed from the file';
COMMENT ON COLUMN public.metadata_stripping_audit.original_size IS 'File size in bytes before metadata stripping';
COMMENT ON COLUMN public.metadata_stripping_audit.cleaned_size IS 'File size in bytes after metadata stripping';

