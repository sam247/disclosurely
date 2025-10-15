-- Add manual_risk_level column to reports table
-- This allows users to manually assign a risk level (1-5) to reports

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS manual_risk_level INTEGER CHECK (manual_risk_level >= 1 AND manual_risk_level <= 5);

-- Add comment for documentation
COMMENT ON COLUMN public.reports.manual_risk_level IS 'User-assigned risk level (1-5): 1-2=Low, 3=Medium, 4-5=High';

