-- ============================================================================
-- Database Index Optimization for 200+ Customer Scale
-- Purpose: Add indexes to improve query performance at scale
-- Date: 2025-02-02
-- ============================================================================

-- ============================================================================
-- PART 1: Organization-Scoped Queries (Most Common Pattern)
-- ============================================================================

-- Indexes for organization_id lookups (used in most RLS policies and queries)
CREATE INDEX IF NOT EXISTS idx_organizations_id_active
ON public.organizations(id)
WHERE id IS NOT NULL;

-- Reports - organization_id is the most common filter
CREATE INDEX IF NOT EXISTS idx_reports_org_status_created
ON public.reports(organization_id, status, created_at DESC)
WHERE deleted_at IS NULL;

-- Index for report lookups by tracking_id (anonymous access)
CREATE INDEX IF NOT EXISTS idx_reports_tracking_id
ON public.reports(tracking_id)
WHERE tracking_id IS NOT NULL;

-- Index for report lookups by organization and assigned user
CREATE INDEX IF NOT EXISTS idx_reports_org_assigned
ON public.reports(organization_id, assigned_to, status)
WHERE deleted_at IS NULL AND assigned_to IS NOT NULL;

-- Index for report lookups by organization and tags (for filtering)
CREATE INDEX IF NOT EXISTS idx_reports_org_tags
ON public.reports USING GIN(organization_id, tags)
WHERE deleted_at IS NULL;

-- ============================================================================
-- PART 2: User and Profile Queries
-- ============================================================================

-- Profiles - organization_id lookups (already exists from RLS migration, but add email index)
CREATE INDEX IF NOT EXISTS idx_profiles_email_active
ON public.profiles(email, is_active)
WHERE is_active = true AND email IS NOT NULL;

-- User roles - organization and user lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_org
ON public.user_roles(user_id, organization_id, is_active)
WHERE is_active = true;

-- User invitations - organization and token lookups
CREATE INDEX IF NOT EXISTS idx_user_invitations_org_token
ON public.user_invitations(organization_id, token, expires_at, accepted_at)
WHERE accepted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_invitations_email
ON public.user_invitations(email, organization_id)
WHERE accepted_at IS NULL;

-- ============================================================================
-- PART 3: Workflow and Automation Queries
-- ============================================================================

-- Assignment rules - organization lookups
CREATE INDEX IF NOT EXISTS idx_assignment_rules_org_enabled
ON public.assignment_rules(organization_id, is_enabled, priority)
WHERE is_enabled = true;

-- SLA policies - organization lookups
CREATE INDEX IF NOT EXISTS idx_sla_policies_org_default
ON public.sla_policies(organization_id, is_default)
WHERE is_default = true;

-- Case escalations - organization and report lookups
CREATE INDEX IF NOT EXISTS idx_case_escalations_org_report
ON public.case_escalations(organization_id, report_id, created_at DESC);

-- Workflow logs - organization and report lookups
CREATE INDEX IF NOT EXISTS idx_workflow_logs_org_report
ON public.workflow_logs(organization_id, report_id, created_at DESC);

-- ============================================================================
-- PART 4: Audit and Compliance Queries
-- ============================================================================

-- Audit logs - organization and user lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_user_created
ON public.audit_logs(organization_id, user_id, created_at DESC)
WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_report_created
ON public.audit_logs(report_id, created_at DESC)
WHERE report_id IS NOT NULL;

-- Compliance policies - organization lookups
CREATE INDEX IF NOT EXISTS idx_compliance_policies_org_active
ON public.compliance_policies(organization_id, is_active)
WHERE is_active = true;

-- Policy acknowledgments - organization and user lookups
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_org_user
ON public.policy_acknowledgments(organization_id, user_id, acknowledged_at DESC);

-- ============================================================================
-- PART 5: Messaging and Communication Queries
-- ============================================================================

-- Report messages - report and organization lookups
CREATE INDEX IF NOT EXISTS idx_report_messages_report_created
ON public.report_messages(report_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_messages_org_created
ON public.report_messages(organization_id, created_at DESC)
WHERE organization_id IS NOT NULL;

-- Report notes - report and author lookups
CREATE INDEX IF NOT EXISTS idx_report_notes_report_created
ON public.report_notes(report_id, created_at DESC);

-- Notifications - user and organization lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON public.notifications(user_id, is_read, created_at DESC)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_org_created
ON public.notifications(organization_id, created_at DESC)
WHERE organization_id IS NOT NULL;

-- Chat conversations - user lookups
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_status
ON public.chat_conversations(user_id, status, updated_at DESC)
WHERE user_id IS NOT NULL;

-- Chat messages - conversation lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
ON public.chat_messages(conversation_id, created_at DESC);

-- ============================================================================
-- PART 6: Custom Domains and Links
-- ============================================================================

-- Custom domains - organization and domain lookups
CREATE INDEX IF NOT EXISTS idx_custom_domains_org_active
ON public.custom_domains(organization_id, is_active, status)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain
ON public.custom_domains(domain)
WHERE domain IS NOT NULL;

-- Organization links - organization and token lookups
CREATE INDEX IF NOT EXISTS idx_organization_links_org_active
ON public.organization_links(organization_id, is_active, expires_at)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_organization_links_token
ON public.organization_links(token)
WHERE token IS NOT NULL;

-- ============================================================================
-- PART 7: Subscriptions and Billing
-- ============================================================================

-- Subscribers - user and email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_user_subscribed
ON public.subscribers(user_id, subscribed, subscription_status)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscribers_email
ON public.subscribers(email)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer
ON public.subscribers(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Index for subscription end date queries (for grace period checks)
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_end
ON public.subscribers(subscription_end, subscription_status)
WHERE subscription_end IS NOT NULL;

-- ============================================================================
-- PART 8: AI and Analytics Queries
-- ============================================================================

-- AI case analyses - organization and report lookups
CREATE INDEX IF NOT EXISTS idx_ai_case_analyses_org_report
ON public.ai_case_analyses(organization_id, report_id, created_at DESC);

-- AI helper documents - organization lookups
CREATE INDEX IF NOT EXISTS idx_ai_helper_documents_org_user
ON public.ai_helper_documents(organization_id, uploaded_by, created_at DESC);

-- Link analytics - organization and link lookups
CREATE INDEX IF NOT EXISTS idx_link_analytics_org_link_created
ON public.link_analytics(organization_id, link_id, created_at DESC);

-- ============================================================================
-- PART 9: Attachments and Files
-- ============================================================================

-- Report attachments - report lookups
CREATE INDEX IF NOT EXISTS idx_report_attachments_report_created
ON public.report_attachments(report_id, created_at DESC);

-- Report drafts - organization and token lookups
CREATE INDEX IF NOT EXISTS idx_report_drafts_org_token
ON public.report_drafts(organization_id, token, expires_at)
WHERE token IS NOT NULL;

-- ============================================================================
-- PART 10: Session Management
-- ============================================================================

-- User sessions - user and session lookups (already optimized in RLS migration)
-- Add index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_active_activity
ON public.user_sessions(is_active, last_activity_at)
WHERE is_active = true;

-- ============================================================================
-- PART 11: Composite Indexes for Common Query Patterns
-- ============================================================================

-- Reports: organization + status + priority (for dashboard views)
CREATE INDEX IF NOT EXISTS idx_reports_org_status_priority
ON public.reports(organization_id, status, priority, created_at DESC)
WHERE deleted_at IS NULL;

-- Reports: organization + assigned_to + status (for assigned reports view)
CREATE INDEX IF NOT EXISTS idx_reports_org_assigned_status
ON public.reports(organization_id, assigned_to, status, created_at DESC)
WHERE deleted_at IS NULL AND assigned_to IS NOT NULL;

-- Reports: organization + manual_risk_level (for risk filtering)
CREATE INDEX IF NOT EXISTS idx_reports_org_risk_level
ON public.reports(organization_id, manual_risk_level, created_at DESC)
WHERE deleted_at IS NULL AND manual_risk_level IS NOT NULL;

-- ============================================================================
-- PART 12: Full-Text Search Indexes (if needed)
-- ============================================================================

-- Note: Full-text search on encrypted_content is not possible
-- But we can index tracking_id for quick lookups
-- (already done above)

-- ============================================================================
-- PART 13: Maintenance and Monitoring
-- ============================================================================

-- Index for finding expired records (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_organization_links_expires_at
ON public.organization_links(expires_at)
WHERE expires_at IS NOT NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at
ON public.user_invitations(expires_at, accepted_at)
WHERE expires_at IS NOT NULL AND accepted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_report_drafts_expires_at
ON public.report_drafts(expires_at)
WHERE expires_at IS NOT NULL;

-- ============================================================================
-- Summary
-- ============================================================================

-- This migration adds 40+ indexes optimized for:
-- 1. Organization-scoped queries (most common pattern)
-- 2. User and profile lookups
-- 3. Workflow and automation queries
-- 4. Audit and compliance queries
-- 5. Messaging and communication
-- 6. Custom domains and links
-- 7. Subscriptions and billing
-- 8. AI and analytics
-- 9. Attachments and files
-- 10. Session management
-- 11. Composite indexes for common query patterns
-- 12. Maintenance queries

-- All indexes use WHERE clauses to:
-- - Reduce index size
-- - Improve query performance
-- - Only index relevant rows

-- Monitor index usage with:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

