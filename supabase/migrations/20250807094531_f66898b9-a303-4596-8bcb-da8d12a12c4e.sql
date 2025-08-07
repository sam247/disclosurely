
-- Drop existing RLS policies for reports table
DROP POLICY IF EXISTS "allow_report_submissions" ON public.reports;
DROP POLICY IF EXISTS "organization_members_select_reports" ON public.reports;
DROP POLICY IF EXISTS "organization_members_update_reports" ON public.reports;
DROP POLICY IF EXISTS "organization_members_delete_reports" ON public.reports;

-- Create a very permissive INSERT policy for anonymous and authenticated users
CREATE POLICY "allow_all_report_submissions" 
ON public.reports 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Recreate SELECT policy for organization members
CREATE POLICY "organization_members_select_reports" 
ON public.reports 
FOR SELECT 
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Recreate UPDATE policy for organization members
CREATE POLICY "organization_members_update_reports" 
ON public.reports 
FOR UPDATE 
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Recreate DELETE policy for organization members
CREATE POLICY "organization_members_delete_reports" 
ON public.reports 
FOR DELETE 
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() AND is_active = true
  )
);
