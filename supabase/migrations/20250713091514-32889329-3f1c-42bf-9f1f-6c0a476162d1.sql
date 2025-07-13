-- Re-enable RLS on reports table with corrected policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Update report_messages policies to allow anonymous messaging
DROP POLICY IF EXISTS "Users can create messages for accessible reports" ON public.report_messages;
DROP POLICY IF EXISTS "Users can view messages for accessible reports" ON public.report_messages;

-- Allow anonymous message creation via report tracking ID lookup
CREATE POLICY "Allow anonymous message creation for reports" 
ON public.report_messages 
FOR INSERT 
WITH CHECK (
  report_id IN (
    SELECT id FROM public.reports 
    WHERE tracking_id IS NOT NULL
  )
);

-- Allow anonymous message viewing via report tracking ID lookup
CREATE POLICY "Allow anonymous message viewing for reports" 
ON public.report_messages 
FOR SELECT 
USING (
  report_id IN (
    SELECT id FROM public.reports 
    WHERE tracking_id IS NOT NULL
  )
);

-- Allow organization members to view and create messages for their reports
CREATE POLICY "Organization members can manage messages" 
ON public.report_messages 
FOR ALL 
USING (
  report_id IN (
    SELECT r.id FROM public.reports r
    JOIN public.profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
)
WITH CHECK (
  report_id IN (
    SELECT r.id FROM public.reports r
    JOIN public.profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
);