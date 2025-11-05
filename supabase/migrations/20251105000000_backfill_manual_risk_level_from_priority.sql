-- Backfill manual_risk_level from priority for existing reports
-- This ensures that reports created before the priority->risk_level mapping
-- will also display the risk level correctly in the dashboard

UPDATE public.reports
SET manual_risk_level = priority
WHERE priority IS NOT NULL 
  AND manual_risk_level IS NULL
  AND priority BETWEEN 1 AND 5;

-- Add comment for documentation
COMMENT ON COLUMN public.reports.manual_risk_level IS 'Risk level (1-5) mapped from priority during submission: 1=Critical, 2=High, 3=Medium, 4=Low, 5=Informational';

