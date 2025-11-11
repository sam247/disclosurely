-- Add notifications for category changes, workflow escalations, and team member joins

-- Function to notify when report category changes
CREATE OR REPLACE FUNCTION public.notify_category_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_category TEXT;
  new_category TEXT;
BEGIN
  -- Extract category from encrypted_content if it changed
  -- Note: We'll need to check if tags changed as tags often contain category info
  -- For now, we'll trigger on tags changes which typically indicate category changes
  IF OLD.tags IS DISTINCT FROM NEW.tags THEN
    -- Create notifications for all active org members
    INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
    SELECT 
      p.id,
      NEW.organization_id,
      NEW.id,
      'category_change',
      'Case Category Updated',
      'The category for case "' || NEW.title || '" has been updated.',
      jsonb_build_object(
        'tracking_id', NEW.tracking_id,
        'old_tags', OLD.tags,
        'new_tags', NEW.tags
      )
    FROM profiles p
    WHERE p.organization_id = NEW.organization_id 
      AND p.is_active = true
      AND p.role IN ('admin', 'case_handler', 'org_admin')
      AND p.id != auth.uid(); -- Don't notify the person who made the change
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for category changes (via tags update)
CREATE TRIGGER notify_category_change_trigger
  AFTER UPDATE OF tags ON reports
  FOR EACH ROW
  WHEN (OLD.tags IS DISTINCT FROM NEW.tags)
  EXECUTE FUNCTION public.notify_category_change();

-- Function to create notification for workflow escalations
-- This will be called from the edge function
CREATE OR REPLACE FUNCTION public.create_escalation_notification(
  p_report_id UUID,
  p_escalated_to UUID,
  p_escalated_from UUID,
  p_reason TEXT,
  p_sla_breached BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_record RECORD;
BEGIN
  -- Get report details
  SELECT r.* INTO report_record
  FROM reports r
  WHERE r.id = p_report_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Notify the person the case was escalated to
  INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
  VALUES (
    p_escalated_to,
    report_record.organization_id,
    p_report_id,
    'workflow_escalation',
    'Case Escalated to You',
    CASE 
      WHEN p_sla_breached THEN 
        'Case "' || report_record.title || '" has been escalated to you due to SLA breach.'
      ELSE 
        'Case "' || report_record.title || '" has been escalated to you. Reason: ' || COALESCE(p_reason, 'No reason provided')
    END,
    jsonb_build_object(
      'tracking_id', report_record.tracking_id,
      'escalated_from', p_escalated_from,
      'escalated_to', p_escalated_to,
      'reason', p_reason,
      'sla_breached', p_sla_breached
    )
  );
  
  -- Also notify org admins about the escalation
  INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    report_record.organization_id,
    p_report_id,
    'workflow_escalation',
    'Case Escalation',
    'Case "' || report_record.title || '" has been escalated' || 
    CASE WHEN p_sla_breached THEN ' due to SLA breach' ELSE '' END || '.',
    jsonb_build_object(
      'tracking_id', report_record.tracking_id,
      'escalated_from', p_escalated_from,
      'escalated_to', p_escalated_to,
      'reason', p_reason,
      'sla_breached', p_sla_breached
    )
  FROM profiles p
  WHERE p.organization_id = report_record.organization_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'org_admin')
    AND p.id != p_escalated_to; -- Don't duplicate notification for the person escalated to
END;
$$;

-- Function to create notification when team member joins
CREATE OR REPLACE FUNCTION public.notify_team_member_joined()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  new_user_profile RECORD;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM user_invitations
  WHERE id = NEW.id AND accepted_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Get new user profile
  SELECT * INTO new_user_profile
  FROM profiles
  WHERE id = invitation_record.user_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Notify org admins about new team member
  INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    invitation_record.organization_id,
    NULL,
    'team_member_joined',
    'New Team Member Joined',
    COALESCE(new_user_profile.first_name || ' ' || new_user_profile.last_name, new_user_profile.email) || 
    ' has joined your organization as ' || invitation_record.role || '.',
    jsonb_build_object(
      'user_id', invitation_record.user_id,
      'user_email', new_user_profile.email,
      'user_name', COALESCE(new_user_profile.first_name || ' ' || new_user_profile.last_name, new_user_profile.email),
      'role', invitation_record.role,
      'invited_by', invitation_record.invited_by
    )
  FROM profiles p
  WHERE p.organization_id = invitation_record.organization_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'org_admin')
    AND p.id != invitation_record.user_id; -- Don't notify the new member themselves
  
  RETURN NEW;
END;
$$;

-- Create trigger for team member joins
CREATE TRIGGER notify_team_member_joined_trigger
  AFTER UPDATE OF accepted_at ON user_invitations
  FOR EACH ROW
  WHEN (OLD.accepted_at IS NULL AND NEW.accepted_at IS NOT NULL)
  EXECUTE FUNCTION public.notify_team_member_joined();

