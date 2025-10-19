-- Extend report_status enum to include new workflow states
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'new';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'closed';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'archived';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'deleted';

-- Add new columns to reports table for workflow tracking
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS first_read_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_reports_first_read_at ON reports(first_read_at);
CREATE INDEX IF NOT EXISTS idx_reports_closed_at ON reports(closed_at);
CREATE INDEX IF NOT EXISTS idx_reports_archived_at ON reports(archived_at);
CREATE INDEX IF NOT EXISTS idx_reports_deleted_at ON reports(deleted_at);
CREATE INDEX IF NOT EXISTS idx_reports_status_workflow ON reports(status, deleted_at);

-- Update existing RLS policies to exclude soft-deleted reports from default queries
DROP POLICY IF EXISTS "Authorized case handlers can view org reports" ON reports;
CREATE POLICY "Authorized case handlers can view org reports" 
ON reports 
FOR SELECT 
USING (
  organization_id IN (
    SELECT p.organization_id
    FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = ANY(ARRAY['admin'::user_role, 'case_handler'::user_role, 'org_admin'::user_role]) 
    AND p.is_active = true
  )
  AND deleted_at IS NULL -- Exclude soft-deleted reports from default queries
);

-- Update existing update policy to exclude soft-deleted reports
DROP POLICY IF EXISTS "Authorized case handlers can update org reports" ON reports;
CREATE POLICY "Authorized case handlers can update org reports" 
ON reports 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT p.organization_id
    FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = ANY(ARRAY['admin'::user_role, 'case_handler'::user_role, 'org_admin'::user_role]) 
    AND p.is_active = true
  )
  AND (deleted_at IS NULL OR auth.uid() = deleted_by) -- Allow updates to soft-deleted reports by the deleter
);

-- Create a policy for admins to view deleted reports
CREATE POLICY "Admins can view deleted reports" 
ON reports 
FOR SELECT 
USING (
  organization_id IN (
    SELECT p.organization_id
    FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'::user_role
    AND p.is_active = true
  )
  AND deleted_at IS NOT NULL
);

-- Function to automatically set first_read_at when status changes from 'new'
CREATE OR REPLACE FUNCTION set_first_read_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing from 'new' to something else, set first_read_at
  IF OLD.status = 'new' AND NEW.status != 'new' AND NEW.first_read_at IS NULL THEN
    NEW.first_read_at = NOW();
  END IF;
  
  -- Set appropriate timestamps based on status changes
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = NOW();
  END IF;
  
  IF NEW.status = 'archived' AND OLD.status != 'archived' THEN
    NEW.archived_at = NOW();
  END IF;
  
  IF NEW.status = 'deleted' AND OLD.status != 'deleted' THEN
    NEW.deleted_at = NOW();
    NEW.deleted_by = auth.uid();
  END IF;
  
  -- Clear timestamps when status changes away
  IF NEW.status != 'closed' AND OLD.status = 'closed' THEN
    NEW.closed_at = NULL;
  END IF;
  
  IF NEW.status != 'archived' AND OLD.status = 'archived' THEN
    NEW.archived_at = NULL;
  END IF;
  
  IF NEW.status != 'deleted' AND OLD.status = 'deleted' THEN
    NEW.deleted_at = NULL;
    NEW.deleted_by = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic timestamp management
DROP TRIGGER IF EXISTS trigger_set_first_read_at ON reports;
CREATE TRIGGER trigger_set_first_read_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION set_first_read_at();