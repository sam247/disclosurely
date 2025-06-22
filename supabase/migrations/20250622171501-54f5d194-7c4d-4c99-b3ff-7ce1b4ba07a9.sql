
-- First, let's check and fix the RLS policies for organization_links table
-- Drop existing policies if they exist to start fresh
DROP POLICY IF EXISTS "Users can view their organization's links" ON public.organization_links;
DROP POLICY IF EXISTS "Users can create links for their organization" ON public.organization_links;
DROP POLICY IF EXISTS "Users can update their organization's links" ON public.organization_links;

-- Create proper RLS policies that work with our current setup
-- Policy for viewing links - users can see links for their organization
CREATE POLICY "Users can view their organization's links" 
  ON public.organization_links 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organization_links.organization_id
    )
  );

-- Policy for creating links - users can create links for their organization
CREATE POLICY "Users can create links for their organization" 
  ON public.organization_links 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organization_links.organization_id
    )
  );

-- Policy for updating links - users can update links for their organization
CREATE POLICY "Users can update their organization's links" 
  ON public.organization_links 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organization_links.organization_id
    )
  );

-- Also ensure profiles table has proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Also ensure organizations table has basic RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing organization policies if they exist
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON public.organizations;

-- Create policies for organizations table
CREATE POLICY "Users can view their organization" 
  ON public.organizations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organizations.id
    )
  );

CREATE POLICY "Org admins can update their organization" 
  ON public.organizations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organizations.id
      AND profiles.role IN ('org_admin', 'admin')
    )
  );
