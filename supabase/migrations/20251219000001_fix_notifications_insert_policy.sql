-- Fix notifications INSERT policy to allow authenticated users to create notifications
-- This fixes the 403 Forbidden error when creating pattern alert notifications

-- Add policy to allow authenticated users to insert notifications for themselves
-- This is needed for pattern alerts and other user-initiated notifications
CREATE POLICY "Users can create notifications for themselves"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_active = true
  )
);
