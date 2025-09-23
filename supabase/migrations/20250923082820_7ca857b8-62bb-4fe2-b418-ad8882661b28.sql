-- Add notification_email field to organizations table for fallback email notifications
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS notification_email text;

-- Add comment to explain the column
COMMENT ON COLUMN organizations.notification_email IS 'Fallback email address for notifications when no active org members are found';