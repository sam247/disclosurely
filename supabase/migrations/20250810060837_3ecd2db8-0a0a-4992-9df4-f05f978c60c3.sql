
-- Drop the existing anonymous submission policy
DROP POLICY IF EXISTS "Anonymous submissions allowed" ON reports;

-- Create a new policy that explicitly allows anonymous inserts
-- This policy allows INSERT operations without authentication requirements
CREATE POLICY "Allow anonymous report submissions" 
  ON reports 
  FOR INSERT 
  WITH CHECK (
    -- Allow any insert where the report is being submitted via a valid link
    submitted_via_link_id IS NOT NULL
    AND submitted_via_link_id IN (
      SELECT id FROM organization_links 
      WHERE is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
      AND (usage_limit IS NULL OR usage_count < usage_limit)
    )
  );

-- Also ensure the anon role can read from organization_links for validation
GRANT SELECT ON organization_links TO anon;
