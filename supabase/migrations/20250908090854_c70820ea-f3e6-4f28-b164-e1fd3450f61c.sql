-- Fix infinite recursion in RLS policies by creating security definer functions

-- Create function to get current user's organization ID safely
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user is in organization safely
CREATE OR REPLACE FUNCTION public.user_is_in_organization(org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id = org_id 
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user has specific role safely
CREATE OR REPLACE FUNCTION public.user_has_organization_role(required_roles user_role[])
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = ANY(required_roles)
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing problematic policies on profiles table
DROP POLICY IF EXISTS "Organization members can view profiles in their org" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;

-- Recreate policies using security definer functions
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Organization members can view profiles in their org" ON public.profiles  
FOR SELECT USING (
  auth.uid() = id OR 
  (organization_id IS NOT NULL AND organization_id = public.get_current_user_organization_id())
);

-- Fix other tables that had similar issues
DROP POLICY IF EXISTS "Users can view analyses in their organization" ON public.ai_case_analyses;
CREATE POLICY "Users can view analyses in their organization" ON public.ai_case_analyses
FOR SELECT USING (public.user_is_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can create analyses in their organization" ON public.ai_case_analyses;
CREATE POLICY "Users can create analyses in their organization" ON public.ai_case_analyses  
FOR INSERT WITH CHECK (public.user_is_in_organization(organization_id) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own analyses" ON public.ai_case_analyses;
CREATE POLICY "Users can update their own analyses" ON public.ai_case_analyses
FOR UPDATE USING (public.user_is_in_organization(organization_id) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.ai_case_analyses;
CREATE POLICY "Users can delete their own analyses" ON public.ai_case_analyses
FOR DELETE USING (public.user_is_in_organization(organization_id) AND created_by = auth.uid());