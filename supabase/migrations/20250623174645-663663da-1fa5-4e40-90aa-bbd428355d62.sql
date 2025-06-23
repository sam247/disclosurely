
-- Update the check constraint to allow both 'whistleblower' and 'organization' values
ALTER TABLE public.report_messages 
DROP CONSTRAINT IF EXISTS report_messages_sender_type_check;

ALTER TABLE public.report_messages 
ADD CONSTRAINT report_messages_sender_type_check 
CHECK (sender_type IN ('whistleblower', 'organization'));
