
-- Drop the existing policy that's incorrectly applied to public role
DROP POLICY IF EXISTS "Allow anonymous submissions via links" ON reports;

-- Create the correct policy that targets the anon role specifically
CREATE POLICY "Allow anonymous submissions via links"
ON reports
FOR INSERT TO anon
WITH CHECK (
    (submitted_via_link_id IS NOT NULL) AND 
    (report_type = 'anonymous'::report_type) AND 
    (submitted_by_email IS NULL)
);

-- Also ensure we have a policy for authenticated organization users to view/manage reports
-- This should already exist, but let's make sure it's correct
CREATE POLICY IF NOT EXISTS "Allow org users to view reports"
ON reports
FOR SELECT TO authenticated
USING (
    organization_id IN (
        SELECT profiles.organization_id
        FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.is_active = true
    )
);

CREATE POLICY IF NOT EXISTS "Allow org users to update reports"
ON reports
FOR UPDATE TO authenticated
USING (
    organization_id IN (
        SELECT profiles.organization_id
        FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.is_active = true
    )
);
