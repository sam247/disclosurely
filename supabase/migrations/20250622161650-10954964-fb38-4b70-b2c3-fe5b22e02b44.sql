
-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop ALL existing policies with more specific names that might still exist
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile and org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can update profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view organization profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can update organization profiles" ON public.profiles;

-- Also drop the security definer functions that might be causing issues
DROP FUNCTION IF EXISTS public.get_user_organization_id(UUID);
DROP FUNCTION IF EXISTS public.is_org_admin(UUID);

-- Completely disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create the most basic policies possible
CREATE POLICY "profiles_select_own" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow upsert operations (which combine insert/update)
CREATE POLICY "profiles_upsert" 
  ON public.profiles 
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
