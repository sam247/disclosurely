-- Add RLS policy to allow users to update their own notifications (mark as read)
-- This is necessary so 'mark as read' and 'clear all' persist across refreshes

-- Ensure RLS is enabled (it already is, but this is idempotent)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for UPDATE on notifications for the owner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'notifications' 
      AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END$$;
