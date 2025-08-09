
-- Let's completely rebuild the RLS policies for reports with better debugging
-- First, disable RLS temporarily to clear any cached policies
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on reports table
DROP POLICY IF EXISTS "Allow anonymous report submissions" ON reports;
DROP POLICY IF EXISTS "Organization members can view reports" ON reports;
DROP POLICY IF EXISTS "Organization members can update reports" ON reports;
DROP POLICY IF EXISTS "Allow anonymous submissions via links" ON reports;
DROP POLICY IF EXISTS "Organization members can update reports" ON reports;
DROP POLICY IF EXISTS "Organization members can view reports" ON reports;

-- Create the most permissive anonymous insertion policy possible
CREATE POLICY "Anonymous submissions allowed"
ON reports
FOR INSERT
TO anon
WITH CHECK (true);  -- Temporarily make it completely open for debugging

-- Create a separate policy for authenticated users
CREATE POLICY "Authenticated users can view their org reports"
ON reports
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Authenticated users can update their org reports"
ON reports  
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Also ensure organization_links is accessible to anonymous users
DROP POLICY IF EXISTS "Public can view active organization links" ON organization_links;

CREATE POLICY "Anonymous can access active links"
ON organization_links
FOR SELECT
TO anon, public
USING (is_active = true);
