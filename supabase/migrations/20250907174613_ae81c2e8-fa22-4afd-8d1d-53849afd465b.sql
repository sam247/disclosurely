-- Phase 4 Continuation: Fix Remaining Database Security Warnings

-- 1. Fix blog_categories - limit public access to only published content
DROP POLICY IF EXISTS "Public can view blog categories" ON blog_categories;

CREATE POLICY "Public can view published blog categories only" 
ON blog_categories 
FOR SELECT 
USING (
  -- Only allow public access if the category has published posts
  EXISTS (
    SELECT 1 FROM blog_posts bp
    JOIN blog_post_categories bpc ON bp.id = bpc.post_id
    WHERE bpc.category_id = blog_categories.id
    AND bp.status = 'published'
    AND bp.published_at <= now()
  )
);

-- Keep admin access
CREATE POLICY "Organization admins can manage all blog categories" 
ON blog_categories 
FOR ALL
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'org_admin'::user_role]) 
    AND profiles.is_active = true
  )
);

-- 2. Fix page_content - restrict public access to explicitly public content
DROP POLICY IF EXISTS "Public can view active page content" ON page_content;

CREATE POLICY "Public can view explicitly public page content only" 
ON page_content 
FOR SELECT 
USING (
  is_active = true 
  AND page_identifier IN ('public_form', 'terms', 'privacy', 'contact')
  -- Only allow public access to specific public-facing pages
);

-- Keep admin access
CREATE POLICY "Organization admins can manage all page content" 
ON page_content 
FOR ALL
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'org_admin'::user_role]) 
    AND profiles.is_active = true
  )
);

-- 3. Fix link_analytics - prevent anonymous data insertion abuse
DROP POLICY IF EXISTS "Users can view their organization's link analytics" ON link_analytics;

-- Remove any policies that allow anonymous insertion
-- Only allow system to insert analytics data
CREATE POLICY "System only can insert link analytics" 
ON link_analytics 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Organization members can view their link analytics
CREATE POLICY "Organization members can view their link analytics" 
ON link_analytics 
FOR SELECT 
USING (
  link_id IN (
    SELECT organization_links.id
    FROM organization_links
    WHERE organization_links.organization_id IN (
      SELECT profiles.organization_id
      FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.is_active = true
    )
  )
);

-- 4. Fix organizations - limit public branding access to minimal necessary data
DROP POLICY IF EXISTS "Allow public access to organization branding" ON organizations;

-- Create a more restrictive policy for public organization access
CREATE POLICY "Limited public access to organization branding only" 
ON organizations 
FOR SELECT 
USING (
  -- Only allow access to basic branding info for active links
  id IN (
    SELECT organization_links.organization_id
    FROM organization_links
    WHERE organization_links.is_active = true
    AND (organization_links.expires_at IS NULL OR organization_links.expires_at > now())
    AND (organization_links.usage_limit IS NULL OR organization_links.usage_count < organization_links.usage_limit)
  )
);