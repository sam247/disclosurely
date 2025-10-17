-- Update report_status enum to change 'in_review' to 'reviewing'
-- This migration updates the enum value for better naming consistency

-- First, update any existing records that have 'in_review' status
UPDATE public.reports 
SET status = 'reviewing'::report_status 
WHERE status = 'in_review'::report_status;

-- Add the new enum value
ALTER TYPE public.report_status ADD VALUE IF NOT EXISTS 'reviewing';

-- Note: PostgreSQL doesn't allow removing enum values directly
-- The old 'in_review' value will remain in the enum but won't be used
-- This is safe as it doesn't affect functionality
