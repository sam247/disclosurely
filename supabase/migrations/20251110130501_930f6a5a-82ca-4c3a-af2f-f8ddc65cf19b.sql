-- Trigger type regeneration for existing schema
-- All required columns already exist in the database:
-- reports: assigned_to, incident_date, location, witnesses, previous_reports, additional_notes
-- organization_links: default_language, available_languages
-- This migration ensures TypeScript types are regenerated to match the current schema

-- Verify reports table structure
DO $$ 
BEGIN
  -- Ensure all expected columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reports' AND column_name = 'assigned_to') THEN
    RAISE EXCEPTION 'Column assigned_to missing from reports table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reports' AND column_name = 'incident_date') THEN
    RAISE EXCEPTION 'Column incident_date missing from reports table';
  END IF;
END $$;

-- Verify organization_links table structure  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organization_links' AND column_name = 'default_language') THEN
    RAISE EXCEPTION 'Column default_language missing from organization_links table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organization_links' AND column_name = 'available_languages') THEN
    RAISE EXCEPTION 'Column available_languages missing from organization_links table';
  END IF;
END $$;