-- Report Drafts Table
-- Stores temporary draft reports that expire after 48 hours
CREATE TABLE public.report_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Unique draft code (e.g., DR-A7K9-M3P2-X8Q5)
  draft_code TEXT UNIQUE NOT NULL,

  -- Encrypted draft content (similar to reports table)
  encrypted_content TEXT NOT NULL,
  encryption_key_hash TEXT NOT NULL,

  -- Resume state
  current_step INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en',

  -- File metadata (store file info, but not files themselves until submission)
  file_metadata JSONB DEFAULT '[]',

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Save tracking
  save_count INTEGER DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups by draft code
CREATE INDEX idx_report_drafts_draft_code ON public.report_drafts(draft_code);

-- Index for finding expired drafts (for cleanup job)
CREATE INDEX idx_report_drafts_expires_at ON public.report_drafts(expires_at);

-- RLS Policies
ALTER TABLE public.report_drafts ENABLE ROW LEVEL SECURITY;

-- Anyone can create a draft (anonymous)
CREATE POLICY "Anyone can create drafts"
  ON public.report_drafts
  FOR INSERT
  WITH CHECK (true);

-- Anyone can read drafts (will be verified by draft_code in service layer)
CREATE POLICY "Anyone can read drafts with code"
  ON public.report_drafts
  FOR SELECT
  USING (true);

-- Anyone can update drafts (will be verified by draft_code in service layer)
CREATE POLICY "Anyone can update drafts"
  ON public.report_drafts
  FOR UPDATE
  USING (true);

-- Anyone can delete drafts (for cleanup after submission)
CREATE POLICY "Anyone can delete drafts"
  ON public.report_drafts
  FOR DELETE
  USING (true);

-- Function to generate unique draft code
CREATE OR REPLACE FUNCTION public.generate_draft_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT;
  segment TEXT;
  i INTEGER;
  is_unique BOOLEAN := false;
BEGIN
  WHILE NOT is_unique LOOP
    result := 'DR';

    -- Generate 4 segments of 4 characters each
    FOR i IN 1..4 LOOP
      segment := '';
      FOR j IN 1..4 LOOP
        segment := segment || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;
      result := result || '-' || segment;
    END LOOP;

    -- Check if code already exists
    PERFORM 1 FROM public.report_drafts WHERE draft_code = result;
    IF NOT FOUND THEN
      is_unique := true;
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

-- Cleanup function to delete expired drafts
CREATE OR REPLACE FUNCTION public.cleanup_expired_drafts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.report_drafts
  WHERE expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON TABLE public.report_drafts IS 'Temporary storage for incomplete whistleblower reports. Expires after 48 hours.';
COMMENT ON COLUMN public.report_drafts.draft_code IS 'Unique code used to resume draft (e.g., DR-A7K9-M3P2-X8Q5)';
COMMENT ON COLUMN public.report_drafts.encrypted_content IS 'Encrypted JSON of ProgressiveFormData interface';
COMMENT ON COLUMN public.report_drafts.expires_at IS 'Timestamp when draft expires (48 hours from creation)';