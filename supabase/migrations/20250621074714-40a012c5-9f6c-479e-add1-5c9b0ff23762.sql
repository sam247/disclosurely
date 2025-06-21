
-- Create notifications table for alerting users of new reports and messages
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_report', 'new_message', 'report_assigned', 'report_status_changed'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_notifications table for tracking email alerts sent
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notification_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on both tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their organization's notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for email_notifications  
CREATE POLICY "Users can view their organization's email notifications" 
  ON public.email_notifications 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can create email notifications" 
  ON public.email_notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Function to create notifications when new reports are submitted
CREATE OR REPLACE FUNCTION public.notify_new_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create notifications for all active users in the organization
  INSERT INTO public.notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    NEW.organization_id,
    NEW.id,
    'new_report',
    'New Report Submitted',
    'A new report "' || NEW.title || '" has been submitted.',
    jsonb_build_object('tracking_id', NEW.tracking_id, 'report_type', NEW.report_type)
  FROM public.profiles p
  WHERE p.organization_id = NEW.organization_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$;

-- Function to create notifications when new messages are sent
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report_record RECORD;
BEGIN
  -- Get report details
  SELECT r.*, o.id as org_id INTO report_record
  FROM public.reports r
  JOIN public.organizations o ON r.organization_id = o.id
  WHERE r.id = NEW.report_id;
  
  -- If message is from organization to whistleblower, no internal notification needed
  IF NEW.sender_type = 'organization' THEN
    RETURN NEW;
  END IF;
  
  -- Create notifications for organization users when whistleblower sends message
  INSERT INTO public.notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    report_record.org_id,
    NEW.report_id,
    'new_message',
    'New Message on Report',
    'New message received on report "' || report_record.title || '"',
    jsonb_build_object('tracking_id', report_record.tracking_id, 'sender_type', NEW.sender_type)
  FROM public.profiles p
  WHERE p.organization_id = report_record.org_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$;

-- Function to create notifications when reports are assigned
CREATE OR REPLACE FUNCTION public.notify_report_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify if assignment changed and there's an assignee
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, organization_id, report_id, type, title, message, metadata)
    VALUES (
      NEW.assigned_to,
      NEW.organization_id,
      NEW.id,
      'report_assigned',
      'Report Assigned to You',
      'Report "' || NEW.title || '" has been assigned to you.',
      jsonb_build_object('tracking_id', NEW.tracking_id, 'previous_assignee', OLD.assigned_to)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER notify_new_report_trigger
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_report();

CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON public.report_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

CREATE TRIGGER notify_report_assignment_trigger
  AFTER UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_report_assignment();

-- Add index for better performance
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at);
CREATE INDEX idx_notifications_org_type ON public.notifications(organization_id, type, created_at);
