
-- Enable RLS on the reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous report submissions" ON reports;
DROP POLICY IF EXISTS "Allow report submissions via organization links" ON reports;
DROP POLICY IF EXISTS "Allow public report submissions via links" ON reports;

-- Policy to allow anonymous report submissions via organization links
CREATE POLICY "Allow report submissions via organization links" ON reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Ensure the submission is via an active organization link
  submitted_via_link_id IS NOT NULL
  AND EXISTS (
    SELECT 1 
    FROM organization_links 
    WHERE 
      id = submitted_via_link_id 
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
      AND (usage_limit IS NULL OR usage_count < usage_limit)
  )
);

-- Function to increment usage count for the link after successful insertion
CREATE OR REPLACE FUNCTION increment_link_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organization_links
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = NEW.submitted_via_link_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS increment_link_usage_trigger ON reports;

-- Create trigger to automatically increment usage count
CREATE TRIGGER increment_link_usage_trigger
AFTER INSERT ON reports
FOR EACH ROW
WHEN (NEW.submitted_via_link_id IS NOT NULL)
EXECUTE FUNCTION increment_link_usage_count();
