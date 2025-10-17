-- Add 'reviewing' to report_status enum
-- This is needed because the frontend now uses 'reviewing' instead of 'in_review'

-- Add the new enum value
ALTER TYPE public.report_status ADD VALUE IF NOT EXISTS 'reviewing';

-- Update any existing records that might have 'in_review' status
UPDATE public.reports 
SET status = 'reviewing'::report_status 
WHERE status = 'in_review'::report_status;
