
-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_upsert" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Temporarily disable RLS to clear any stuck states
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_select_policy" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Ensure organizations table has proper RLS but no recursive queries
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update their organization" ON public.organizations;

-- Simple organization policies
CREATE POLICY "orgs_insert_policy" 
  ON public.organizations 
  FOR INSERT 
  WITH CHECK (true); -- Allow any authenticated user to create an org

CREATE POLICY "orgs_select_policy" 
  ON public.organizations 
  FOR SELECT 
  USING (true); -- Allow reading organizations (we'll handle access in app logic)

CREATE POLICY "orgs_update_policy" 
  ON public.organizations 
  FOR UPDATE 
  USING (true); -- Allow updates (we'll handle permissions in app logic)
