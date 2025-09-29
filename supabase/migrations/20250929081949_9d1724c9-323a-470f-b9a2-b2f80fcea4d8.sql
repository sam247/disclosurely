-- Fix infinite recursion in profiles table RLS policies
-- The issue is that policies are trying to query the profiles table from within profiles policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Org members can view basic org member info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Create a security definer function to safely get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_safe(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_org_id uuid;
BEGIN
  SELECT organization_id INTO user_org_id
  FROM profiles 
  WHERE id = p_user_id AND is_active = true;
  
  RETURN user_org_id;
END;
$$;

-- Create new safe policies for profiles table
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id AND auth.uid() IS NOT NULL);

CREATE POLICY "Organization members can view basic member info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id IS NOT NULL 
  AND organization_id = get_user_organization_safe(auth.uid())
  AND auth.uid() != id  -- Don't use this policy for own profile
);

-- Keep existing policies for INSERT, UPDATE, DELETE as they don't have recursion issues
-- Users can insert their own profile only - already exists and works
-- Users can update their own profile only - already exists and works  
-- Users can delete their own profile only - already exists and works