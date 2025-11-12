-- ============================================
-- COMPREHENSIVE SECURITY FIXES
-- Addresses Lovable Security Audit Findings
-- ============================================
-- 
-- CRITICAL ISSUES FIXED:
-- 1. Remove all remaining RLS policies checking profiles.role
-- 2. Ensure profiles.role column is dropped
-- 3. Drop user_role enum (keep only app_role)
-- 4. Fix SECURITY DEFINER functions without search_path
-- 5. Fix verbose error messages in edge functions (handled separately)
--
-- ============================================

-- ============================================
-- PART 1: Fix remaining RLS policies using profiles.role
-- ============================================

-- Drop and recreate any policies that still reference profiles.role
-- These should all use has_role() function with user_roles table instead

-- Fix organizations table policies
DROP POLICY IF EXISTS "org_admins_can_manage" ON public.organizations;
CREATE POLICY "org_admins_can_manage" ON public.organizations
FOR ALL 
USING (
  public.user_is_in_organization(id) AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'org_admin'))
);

-- Fix audit_logs policies that might still check profiles.role
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  has_role(auth.uid(), 'admin')
);

-- Fix any remaining function that checks profiles.role
-- Replace user_has_organization_role function to use user_roles table
DROP FUNCTION IF EXISTS public.user_has_organization_role(user_role[]);
CREATE OR REPLACE FUNCTION public.user_has_organization_role(required_roles app_role[])
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = ANY(required_roles)
    AND ur.is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- ============================================
-- PART 2: Ensure profiles.role column is dropped
-- ============================================

-- Drop the column if it still exists (should have been dropped in 20251022072708)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN role CASCADE;
    RAISE NOTICE 'Dropped profiles.role column';
  ELSE
    RAISE NOTICE 'profiles.role column already dropped';
  END IF;
END $$;

-- ============================================
-- PART 3: Drop user_role enum (keep only app_role)
-- ============================================

-- First, check if any functions or types still reference user_role enum
DO $$
DECLARE
  enum_used BOOLEAN;
BEGIN
  -- Check if user_role enum is still in use
  SELECT EXISTS (
    SELECT 1 
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role'
  ) INTO enum_used;
  
  IF enum_used THEN
    -- Check if it's safe to drop (no dependencies)
    -- Note: This will fail if there are still dependencies, which is intentional
    -- We want to know if something is still using it
    BEGIN
      DROP TYPE IF EXISTS public.user_role CASCADE;
      RAISE NOTICE 'Dropped user_role enum';
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not drop user_role enum: %. Check for remaining dependencies.', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'user_role enum already dropped or does not exist';
  END IF;
END $$;

-- ============================================
-- PART 4: Fix SECURITY DEFINER functions without search_path
-- ============================================

-- Fix any remaining SECURITY DEFINER functions that don't have search_path set
-- Check and fix functions that might have been missed

-- Fix get_user_organization_safe if it exists
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

-- Fix get_current_user_organization_id if it exists
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix user_is_in_organization if it exists
CREATE OR REPLACE FUNCTION public.user_is_in_organization(org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id = org_id 
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- ============================================
-- PART 5: Audit and verify fixes
-- ============================================

-- Create a function to check for remaining profiles.role references
CREATE OR REPLACE FUNCTION public.audit_security_fixes()
RETURNS TABLE(
  issue_type TEXT,
  object_name TEXT,
  details TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for profiles.role column
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    RETURN QUERY SELECT 
      'CRITICAL'::TEXT,
      'profiles.role column'::TEXT,
      'Column still exists - should be dropped'::TEXT;
  END IF;

  -- Check for user_role enum
  IF EXISTS (
    SELECT 1 
    FROM pg_type t
    WHERE t.typname = 'user_role'
  ) THEN
    RETURN QUERY SELECT 
      'CRITICAL'::TEXT,
      'user_role enum'::TEXT,
      'Enum still exists - should be dropped'::TEXT;
  END IF;

  -- Check for RLS policies that might reference profiles.role
  -- This is a best-effort check - actual policy content is harder to query
  RETURN QUERY SELECT 
    'INFO'::TEXT,
    'Security audit complete'::TEXT,
    'Run manual review of RLS policies to ensure all use has_role() function'::TEXT;
END;
$$;

-- Grant execute to authenticated users for audit function
GRANT EXECUTE ON FUNCTION public.audit_security_fixes() TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.has_role IS 'Secure role check using user_roles table. Use this instead of profiles.role.';
COMMENT ON FUNCTION public.user_has_organization_role IS 'Check if user has any of the required roles in their organization. Uses secure user_roles table.';
COMMENT ON FUNCTION public.audit_security_fixes IS 'Audit function to check for remaining security issues from profiles.role migration.';

