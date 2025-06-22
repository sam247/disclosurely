
-- First, let's disable RLS temporarily to check what policies exist
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop ALL policies on profiles table completely
DROP POLICY IF EXISTS "Users can view their own profile and org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can update profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view organization profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can update organization profiles" ON public.profiles;

-- Temporarily disable RLS to allow the operation to complete
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create much simpler, non-recursive policies
CREATE POLICY "Allow users to view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- For organization-wide access, we'll handle this in the application layer for now
-- to avoid any recursive policy issues
