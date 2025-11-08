-- Add initialization vector (IV) column for proper AES-GCM encryption
-- The IV is required for secure encryption and must be stored alongside encrypted content

ALTER TABLE public.report_drafts
ADD COLUMN iv TEXT;

COMMENT ON COLUMN public.report_drafts.iv IS 'Initialization vector for AES-GCM encryption, stored as base64';
