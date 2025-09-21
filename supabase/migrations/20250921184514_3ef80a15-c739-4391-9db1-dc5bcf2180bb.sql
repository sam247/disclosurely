-- Make user_id nullable in email_notifications table to support anonymous report notifications
ALTER TABLE public.email_notifications ALTER COLUMN user_id DROP NOT NULL;