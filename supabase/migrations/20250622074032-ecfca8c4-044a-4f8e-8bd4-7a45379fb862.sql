
-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile and org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can update profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view organization profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can update organization profiles" ON public.profiles;

-- Create a security definer function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- Create a security definer function to check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'org_admin' AND is_active = true
  );
$$;

-- Create new policies using the security definer functions
CREATE POLICY "Users can view their own profile and org profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() OR 
    organization_id = public.get_user_organization_id(auth.uid())
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Org admins can update profiles in their organization" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.is_org_admin(auth.uid()) AND 
    organization_id = public.get_user_organization_id(auth.uid())
  );

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (id = auth.uid());
