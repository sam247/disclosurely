-- ============================================
-- Migration: User-Based → Organization-Based Subscriptions
-- ============================================
-- This migration converts the subscribers table from user-based to organization-based
-- for proper multi-tenant SaaS architecture.

-- Step 1: Add organization_id column to subscribers table
ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Step 2: Create index for organization_id lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_organization_id 
ON public.subscribers(organization_id) 
WHERE organization_id IS NOT NULL;

-- Step 3: Migrate existing subscription data
-- For each subscriber, find their organization_id from profiles table
-- Priority: Use org where user is org_admin, otherwise use their primary org
UPDATE public.subscribers s
SET organization_id = (
  SELECT COALESCE(
    -- First, try to find org where user is org_admin
    (
      SELECT ur.organization_id
      FROM public.user_roles ur
      WHERE ur.user_id = s.user_id
        AND ur.role = 'org_admin'
        AND ur.is_active = true
      LIMIT 1
    ),
    -- Fallback: use user's primary organization from profiles
    (
      SELECT p.organization_id
      FROM public.profiles p
      WHERE p.id = s.user_id
        AND p.is_active = true
        AND p.organization_id IS NOT NULL
      LIMIT 1
    )
  )
)
WHERE s.organization_id IS NULL
  AND s.user_id IS NOT NULL;

-- Step 4: Handle orphaned subscriptions (users without organizations)
-- Mark subscriptions as expired if user has no organization
UPDATE public.subscribers
SET 
  subscribed = false,
  subscription_status = 'expired',
  organization_id = NULL
WHERE organization_id IS NULL
  AND user_id IS NOT NULL;

-- Step 5: Handle duplicate subscriptions (multiple users in same org with subscriptions)
-- Keep only the most recent active subscription per organization
-- Delete older/duplicate subscriptions
WITH ranked_subscriptions AS (
  SELECT 
    id,
    organization_id,
    ROW_NUMBER() OVER (
      PARTITION BY organization_id 
      ORDER BY 
        CASE WHEN subscribed = true THEN 0 ELSE 1 END,
        updated_at DESC,
        created_at DESC
    ) as rn
  FROM public.subscribers
  WHERE organization_id IS NOT NULL
)
DELETE FROM public.subscribers
WHERE id IN (
  SELECT id FROM ranked_subscriptions WHERE rn > 1
);

-- Step 6: Add unique constraint for one subscription per organization
-- First, ensure no duplicates remain
DO $$
BEGIN
  -- If duplicates still exist, keep the most recent one
  DELETE FROM public.subscribers s1
  WHERE EXISTS (
    SELECT 1 FROM public.subscribers s2
    WHERE s2.organization_id = s1.organization_id
      AND s2.organization_id IS NOT NULL
      AND s2.id != s1.id
      AND (
        s2.updated_at > s1.updated_at
        OR (s2.updated_at = s1.updated_at AND s2.id > s1.id)
      )
  );
END $$;

-- Now add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_organization_unique
ON public.subscribers(organization_id)
WHERE organization_id IS NOT NULL;

-- Step 7: Update RLS policies for organization-based access
-- Drop old policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;

-- Create new organization-based policies
-- Users can view subscription for their organization
CREATE POLICY "Users can view their organization subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_active = true
      AND organization_id IS NOT NULL
  )
);

-- Org admins can update subscription for their organization
CREATE POLICY "Org admins can update their organization subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT ur.organization_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'org_admin')
      AND ur.is_active = true
  )
)
WITH CHECK (
  organization_id IN (
    SELECT ur.organization_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'org_admin')
      AND ur.is_active = true
  )
);

-- Org admins can insert subscription for their organization
CREATE POLICY "Org admins can insert their organization subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT ur.organization_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'org_admin')
      AND ur.is_active = true
  )
);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role can manage all subscriptions"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 8: Add helpful comment
COMMENT ON COLUMN public.subscribers.organization_id IS 
'Organization this subscription belongs to. One subscription per organization.';

-- Step 9: Create helper function to get organization subscription
CREATE OR REPLACE FUNCTION public.get_organization_subscription(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  subscribed BOOLEAN,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  subscription_status TEXT,
  grace_period_ends_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.subscribed,
    s.subscription_tier,
    s.subscription_end,
    s.subscription_status,
    s.grace_period_ends_at
  FROM public.subscribers s
  WHERE s.organization_id = p_organization_id
  LIMIT 1;
END;
$$;

-- Step 10: Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_organization_subscription(UUID) TO authenticated;

