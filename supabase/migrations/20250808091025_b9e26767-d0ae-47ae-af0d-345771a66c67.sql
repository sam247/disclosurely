
-- First, let's see what policies currently exist on the reports table
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'reports';

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow anonymous submissions via links" ON reports;
DROP POLICY IF EXISTS "Allow org users to view reports" ON reports;
DROP POLICY IF EXISTS "Allow org users to update reports" ON reports;

-- Create a very permissive policy for anonymous insertions
CREATE POLICY "Allow anonymous report submissions"
ON reports
FOR INSERT
TO anon, public
WITH CHECK (
  -- Allow any insert where submitted_via_link_id is not null
  -- This covers anonymous submissions via organization links
  submitted_via_link_id IS NOT NULL
  AND report_type = 'anonymous'
  AND submitted_by_email IS NULL
);

-- Recreate the organization member policies
CREATE POLICY "Organization members can view reports"
ON reports
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_active = true
  )
);

CREATE POLICY "Organization members can update reports"
ON reports
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_active = true
  )
);

-- Also ensure the organization_links table allows public reads for active links
-- This is needed for the form to validate the link
DROP POLICY IF EXISTS "Allow public access to active organization links" ON organization_links;

CREATE POLICY "Public can view active organization links"
ON organization_links
FOR SELECT
TO anon, public, authenticated
USING (is_active = true);
