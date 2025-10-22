-- CRITICAL SECURITY FIX: Remove privilege escalation vulnerability (Complete Fix)
-- This migration fixes the dual role system by:
-- 1. Updating ALL RLS policies to use has_role() function (including missing ones)
-- 2. Dropping the profiles.role column to prevent privilege escalation
-- 3. Tightening subscribers table RLS policies

-- ============================================
-- STEP 1: Drop and recreate ALL policies referencing profiles.role
-- ============================================

-- Security Events
DROP POLICY IF EXISTS "Security events restricted to super admins" ON security_events;
CREATE POLICY "Security events restricted to super admins"
ON security_events FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Security Alerts
DROP POLICY IF EXISTS "Security alerts restricted to super admins" ON security_alerts;
CREATE POLICY "Security alerts restricted to super admins"
ON security_alerts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Organization admins can resolve security alerts" ON security_alerts;
CREATE POLICY "Organization admins can resolve security alerts"
ON security_alerts FOR UPDATE
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
)
WITH CHECK (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
  AND resolved_by = auth.uid()
);

-- Login Attempts
DROP POLICY IF EXISTS "Admins can view login attempts" ON login_attempts;
CREATE POLICY "Admins can view login attempts"
ON login_attempts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Reports
DROP POLICY IF EXISTS "Admins can view deleted reports" ON reports;
CREATE POLICY "Admins can view deleted reports"
ON reports FOR SELECT
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND has_role(auth.uid(), 'admin')
  AND deleted_at IS NOT NULL
);

DROP POLICY IF EXISTS "Authorized case handlers can view org reports" ON reports;
CREATE POLICY "Authorized case handlers can view org reports"
ON reports FOR SELECT
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'case_handler') OR has_role(auth.uid(), 'org_admin'))
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS "Authorized case handlers can update org reports" ON reports;
CREATE POLICY "Authorized case handlers can update org reports"
ON reports FOR UPDATE
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'case_handler') OR has_role(auth.uid(), 'org_admin'))
  AND (deleted_at IS NULL OR auth.uid() = deleted_by)
);

-- Report Notes, Messages, Attachments (no role checks needed)
DROP POLICY IF EXISTS "Users can view report notes in their organization" ON report_notes;
CREATE POLICY "Users can view report notes in their organization"
ON report_notes FOR SELECT
USING (
  report_id IN (
    SELECT r.id FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
);

DROP POLICY IF EXISTS "Users can create report notes in their organization" ON report_notes;
CREATE POLICY "Users can create report notes in their organization"
ON report_notes FOR INSERT
WITH CHECK (
  report_id IN (
    SELECT r.id FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
  AND author_id = auth.uid()
);

DROP POLICY IF EXISTS "Organization members can manage all messages" ON report_messages;
CREATE POLICY "Organization members can manage all messages"
ON report_messages FOR ALL
USING (
  report_id IN (
    SELECT r.id FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
)
WITH CHECK (
  report_id IN (
    SELECT r.id FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
);

DROP POLICY IF EXISTS "Organization members can view report attachments" ON report_attachments;
CREATE POLICY "Organization members can view report attachments"
ON report_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE r.id = report_attachments.report_id AND p.id = auth.uid() AND p.is_active = true
  )
);

DROP POLICY IF EXISTS "Organization members can manage report attachments" ON report_attachments;
CREATE POLICY "Organization members can manage report attachments"
ON report_attachments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE r.id = report_attachments.report_id AND p.id = auth.uid() AND p.is_active = true
  )
);

-- Page Content
DROP POLICY IF EXISTS "Organization admins can manage all page content" ON page_content;
CREATE POLICY "Organization admins can manage all page content"
ON page_content FOR ALL
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
);

-- Blog Posts
DROP POLICY IF EXISTS "Organization admins can manage blog posts" ON blog_posts;
CREATE POLICY "Organization admins can manage blog posts"
ON blog_posts FOR ALL
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin') OR has_role(auth.uid(), 'case_handler'))
);

-- Blog Categories
DROP POLICY IF EXISTS "Organization admins can manage all blog categories" ON blog_categories;
CREATE POLICY "Organization admins can manage all blog categories"
ON blog_categories FOR ALL
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
);

-- Blog Post Categories
DROP POLICY IF EXISTS "Organization members can manage post categories" ON blog_post_categories;
CREATE POLICY "Organization members can manage post categories"
ON blog_post_categories FOR ALL
USING (
  post_id IN (
    SELECT bp.id FROM blog_posts bp
    JOIN profiles p ON p.organization_id = bp.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin') OR has_role(auth.uid(), 'case_handler'))
  )
);

-- Global SEO Settings
DROP POLICY IF EXISTS "Organization admins can manage global SEO settings" ON global_seo_settings;
CREATE POLICY "Organization admins can manage global SEO settings"
ON global_seo_settings FOR ALL
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
);

-- SEO Settings
DROP POLICY IF EXISTS "Organization admins can manage SEO settings" ON seo_settings;
CREATE POLICY "Organization admins can manage SEO settings"
ON seo_settings FOR ALL
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
);

-- Data Export Requests
DROP POLICY IF EXISTS "Users can view their own export requests" ON data_export_requests;
CREATE POLICY "Users can view their own export requests"
ON data_export_requests FOR SELECT
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.organization_id = data_export_requests.organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
    AND p.is_active = true
  )
);

DROP POLICY IF EXISTS "Users can create export requests" ON data_export_requests;
CREATE POLICY "Users can create export requests"
ON data_export_requests FOR INSERT
WITH CHECK (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.organization_id = data_export_requests.organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
    AND p.is_active = true
  )
);

-- Data Erasure Requests
DROP POLICY IF EXISTS "Users can view their own erasure requests" ON data_erasure_requests;
CREATE POLICY "Users can view their own erasure requests"
ON data_erasure_requests FOR SELECT
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.organization_id = data_erasure_requests.organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
    AND p.is_active = true
  )
);

DROP POLICY IF EXISTS "Users can create erasure requests" ON data_erasure_requests;
CREATE POLICY "Users can create erasure requests"
ON data_erasure_requests FOR INSERT
WITH CHECK (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.organization_id = data_erasure_requests.organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
    AND p.is_active = true
  )
);

DROP POLICY IF EXISTS "Organization admins can manage erasure requests" ON data_erasure_requests;
CREATE POLICY "Organization admins can manage erasure requests"
ON data_erasure_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.organization_id = data_erasure_requests.organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
    AND p.is_active = true
  )
);

-- Data Retention Policies
DROP POLICY IF EXISTS "Organization admins can manage retention policies" ON data_retention_policies;
CREATE POLICY "Organization admins can manage retention policies"
ON data_retention_policies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.organization_id = data_retention_policies.organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
    AND p.is_active = true
  )
);

DROP POLICY IF EXISTS "Organization members can view retention policies" ON data_retention_policies;
CREATE POLICY "Organization members can view retention policies"
ON data_retention_policies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.organization_id = data_retention_policies.organization_id
    AND p.is_active = true
  )
);

-- User Invitations
DROP POLICY IF EXISTS "Org admins can create invitations" ON user_invitations;
CREATE POLICY "Org admins can create invitations"
ON user_invitations FOR INSERT
WITH CHECK (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND has_role(auth.uid(), 'org_admin')
  AND invited_by = auth.uid()
);

DROP POLICY IF EXISTS "Org admins can update invitations" ON user_invitations;
CREATE POLICY "Org admins can update invitations"
ON user_invitations FOR UPDATE
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND has_role(auth.uid(), 'org_admin')
);

DROP POLICY IF EXISTS "Org admins can delete invitations" ON user_invitations;
CREATE POLICY "Org admins can delete invitations"
ON user_invitations FOR DELETE
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_active = true)
  AND has_role(auth.uid(), 'org_admin')
);

-- Organizations
DROP POLICY IF EXISTS "org_admins_can_manage" ON organizations;
CREATE POLICY "org_admins_can_manage"
ON organizations FOR ALL
USING (
  user_is_in_organization(id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
);

-- Profiles
DROP POLICY IF EXISTS "Org admins can update team member profiles" ON profiles;
CREATE POLICY "Org admins can update team member profiles"
ON profiles FOR UPDATE
USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  AND has_role(auth.uid(), 'org_admin')
)
WITH CHECK (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  AND has_role(auth.uid(), 'org_admin')
);

-- ============================================
-- STEP 2: Fix Subscribers Table RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own subscription" ON subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscribers;

CREATE POLICY "Users can insert own subscription"
ON subscribers FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
ON subscribers FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own subscription"
ON subscribers FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- STEP 3: Drop profiles.role column
-- ============================================

-- Verify user_roles table is populated
DO $$
DECLARE
  profiles_count INTEGER;
  user_roles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profiles_count FROM profiles WHERE is_active = true;
  SELECT COUNT(DISTINCT user_id) INTO user_roles_count FROM user_roles WHERE is_active = true;
  
  IF profiles_count > user_roles_count THEN
    RAISE WARNING 'Warning: % active profiles but only % users in user_roles', profiles_count, user_roles_count;
  END IF;
END $$;

-- Drop the role column
ALTER TABLE profiles DROP COLUMN IF EXISTS role CASCADE;

-- Add comments
COMMENT ON TABLE profiles IS 'User profiles table. Roles managed in user_roles table to prevent privilege escalation.';
COMMENT ON TABLE user_roles IS 'User roles table with proper RLS. Use has_role() function to check permissions.';