-- Fix user_invitations RLS policies to allow org admins to view and manage invitations
-- This fixes the 403 Forbidden error when trying to send invitations

-- Add SELECT policy for org admins to view their organization's invitations
CREATE POLICY "Org admins can view organization invitations"
ON user_invitations FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND is_active = true
  )
  AND (
    has_role(auth.uid(), 'org_admin') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- Ensure INSERT policy uses correct has_role function signature
DROP POLICY IF EXISTS "Org admins can create invitations" ON user_invitations;
CREATE POLICY "Org admins can create invitations"
ON user_invitations FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND is_active = true
  )
  AND (
    has_role(auth.uid(), 'org_admin') 
    OR has_role(auth.uid(), 'admin')
  )
  AND invited_by = auth.uid()
);

-- Ensure UPDATE policy uses correct has_role function signature
DROP POLICY IF EXISTS "Org admins can update invitations" ON user_invitations;
CREATE POLICY "Org admins can update invitations"
ON user_invitations FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND is_active = true
  )
  AND (
    has_role(auth.uid(), 'org_admin') 
    OR has_role(auth.uid(), 'admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND is_active = true
  )
  AND (
    has_role(auth.uid(), 'org_admin') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- Ensure DELETE policy uses correct has_role function signature
DROP POLICY IF EXISTS "Org admins can delete invitations" ON user_invitations;
CREATE POLICY "Org admins can delete invitations"
ON user_invitations FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND is_active = true
  )
  AND (
    has_role(auth.uid(), 'org_admin') 
    OR has_role(auth.uid(), 'admin')
  )
);
