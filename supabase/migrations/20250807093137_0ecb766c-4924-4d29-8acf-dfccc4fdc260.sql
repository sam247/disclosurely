-- Comprehensive RLS Policy for Reports Table aligned with Supabase recommendations
-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "allow_report_submissions" ON public.reports;
DROP POLICY IF EXISTS "Organization members can delete reports" ON public.reports;
DROP POLICY IF EXISTS "Organization members can update reports" ON public.reports;
DROP POLICY IF EXISTS "Organization members can view reports" ON public.reports;

-- Create comprehensive INSERT policy for both anonymous and authenticated users
CREATE POLICY "allow_report_submissions" 
ON public.reports 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Ensure basic required fields are present
  organization_id IS NOT NULL 
  AND tracking_id IS NOT NULL 
  AND title IS NOT NULL 
  AND encrypted_content IS NOT NULL
  AND encryption_key_hash IS NOT NULL
);

-- Create SELECT policy for organization members (authenticated users only)
CREATE POLICY "organization_members_select_reports" 
ON public.reports 
FOR SELECT 
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.is_active = true
  )
);

-- Create UPDATE policy for organization members
CREATE POLICY "organization_members_update_reports" 
ON public.reports 
FOR UPDATE 
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.is_active = true
  )
);

-- Create DELETE policy for organization members  
CREATE POLICY "organization_members_delete_reports" 
ON public.reports 
FOR DELETE 
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.is_active = true
  )
);