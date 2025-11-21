-- Create table to store PII false positive feedback for learning
CREATE TABLE IF NOT EXISTS public.pii_false_positives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  detected_text TEXT NOT NULL,
  detection_type TEXT NOT NULL,
  context TEXT, -- Surrounding text for better understanding
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_verified BOOLEAN DEFAULT false, -- Admin can verify before adding to whitelist
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT, -- Admin notes
  UNIQUE(organization_id, detected_text, detection_type)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pii_false_positives_text ON public.pii_false_positives(detected_text);
CREATE INDEX IF NOT EXISTS idx_pii_false_positives_org ON public.pii_false_positives(organization_id);
CREATE INDEX IF NOT EXISTS idx_pii_false_positives_verified ON public.pii_false_positives(is_verified) WHERE is_verified = true;

-- Enable RLS
ALTER TABLE public.pii_false_positives ENABLE ROW LEVEL SECURITY;

-- Policy: Users can report false positives for their organization
CREATE POLICY "Users can report false positives"
  ON public.pii_false_positives FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = pii_false_positives.organization_id
    )
  );

-- Policy: Users can view false positives for their organization
CREATE POLICY "Users can view false positives"
  ON public.pii_false_positives FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = pii_false_positives.organization_id
    )
  );

-- Policy: Admins can verify false positives
CREATE POLICY "Admins can verify false positives"
  ON public.pii_false_positives FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = pii_false_positives.organization_id
      AND profiles.role IN ('admin', 'org_admin')
    )
  );

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role can manage false positives"
  ON public.pii_false_positives FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

