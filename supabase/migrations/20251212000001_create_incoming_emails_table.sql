-- Create table for storing incoming emails from Resend webhooks
CREATE TABLE IF NOT EXISTS public.incoming_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT UNIQUE NOT NULL, -- Resend email ID
  from_email TEXT NOT NULL,
  to_emails TEXT[] NOT NULL,
  subject TEXT,
  html_content TEXT,
  text_content TEXT,
  headers JSONB DEFAULT '{}'::jsonb,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_incoming_emails_email_id ON public.incoming_emails(email_id);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_to_emails ON public.incoming_emails USING GIN(to_emails);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_processed ON public.incoming_emails(processed);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_received_at ON public.incoming_emails(received_at DESC);

-- Enable RLS
ALTER TABLE public.incoming_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can insert (via webhook)
CREATE POLICY "Service role can insert incoming emails"
  ON public.incoming_emails
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policy: Authenticated users can view incoming emails
-- You may want to restrict this further based on your needs
CREATE POLICY "Authenticated users can view incoming emails"
  ON public.incoming_emails
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Service role can update (for marking as processed)
CREATE POLICY "Service role can update incoming emails"
  ON public.incoming_emails
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_incoming_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incoming_emails_updated_at
  BEFORE UPDATE ON public.incoming_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_incoming_emails_updated_at();

