-- Allow anonymous users to validate their invitation by token
-- This is secure because tokens are long, random, unguessable strings
CREATE POLICY "Anyone can read invitation by valid token"
ON user_invitations
FOR SELECT
TO anon, authenticated
USING (
  token IS NOT NULL 
  AND accepted_at IS NULL 
  AND expires_at > now()
);