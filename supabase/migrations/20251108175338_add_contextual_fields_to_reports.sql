-- Add contextual fields to reports table
-- These are optional fields that whistleblowers can provide for context
-- They should NOT be encrypted (they're contextual metadata, not sensitive PII)

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS incident_date TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS witnesses TEXT,
ADD COLUMN IF NOT EXISTS previous_reports BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

COMMENT ON COLUMN public.reports.incident_date IS 'When the incident occurred (optional, provided by reporter)';
COMMENT ON COLUMN public.reports.location IS 'Where the incident occurred (optional, provided by reporter)';
COMMENT ON COLUMN public.reports.witnesses IS 'Witness information (optional, provided by reporter)';
COMMENT ON COLUMN public.reports.previous_reports IS 'Whether there were previous reports about this issue';
COMMENT ON COLUMN public.reports.additional_notes IS 'Additional contextual information from reporter';

