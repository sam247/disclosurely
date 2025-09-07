-- Phase 4: Fix Critical Data Exposure Issues - Corrected Approach

-- First, let's see what policies currently exist and fix them properly

-- 1. Update existing audit_logs policies to be more restrictive
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Org admins can view organization audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;

-- Create proper restrictive policies for audit_logs
CREATE POLICY "Super admins only can view all audit logs" 
ON audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.is_active = true
  )
);

CREATE POLICY "Users can view only their own audit entries" 
ON audit_logs 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Fix profiles table policies - ensure no public access to email addresses
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON profiles;

-- Recreate profiles policies with proper restrictions
CREATE POLICY "Users can view their own profile only" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile only" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile only" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile only" 
ON profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Add organization-scoped profile viewing for legitimate business needs
CREATE POLICY "Organization members can view basic profile info in their org" 
ON profiles 
FOR SELECT 
USING (
  organization_id IS NOT NULL 
  AND organization_id IN (
    SELECT p.organization_id 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_active = true
  )
  AND auth.uid() != id  -- Don't duplicate the own profile policy
);