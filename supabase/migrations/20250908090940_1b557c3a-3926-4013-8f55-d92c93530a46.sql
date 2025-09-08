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

-- Drop all existing conflicting policies on profiles table
DROP POLICY IF EXISTS "Organization members can view profiles in their org" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate profiles policies using security definer functions to prevent recursion
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_org_members" ON public.profiles  
FOR SELECT USING (
  organization_id IS NOT NULL AND 
  organization_id = public.get_current_user_organization_id()
);

-- Ensure organizations table allows INSERT for new users
DROP POLICY IF EXISTS "Org admins can update their organization" ON public.organizations;
CREATE POLICY "org_admins_can_manage" ON public.organizations
FOR ALL USING (
  public.user_is_in_organization(id) AND
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'org_admin') AND is_active = true)
);

-- Allow authenticated users to insert organizations (for initial setup)
CREATE POLICY "authenticated_users_can_create_orgs" ON public.organizations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');