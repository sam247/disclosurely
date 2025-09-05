-- Create content management tables
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  page_identifier TEXT NOT NULL, -- e.g., 'landing_hero', 'landing_features'
  section_key TEXT NOT NULL, -- e.g., 'title', 'description', 'cta_text'
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'html', 'markdown', 'image_url'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE(organization_id, page_identifier, section_key)
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Create blog post categories junction table
CREATE TABLE public.blog_post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  category_id UUID NOT NULL,
  UNIQUE(post_id, category_id)
);

-- Enable RLS on all tables
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_content
CREATE POLICY "Organization admins can manage page content" 
ON public.page_content 
FOR ALL 
USING (organization_id IN (
  SELECT profiles.organization_id 
  FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'org_admin') 
  AND profiles.is_active = true
));

CREATE POLICY "Public can view active page content"
ON public.page_content
FOR SELECT
USING (is_active = true);

-- RLS policies for blog_posts
CREATE POLICY "Organization admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (organization_id IN (
  SELECT profiles.organization_id 
  FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'org_admin', 'case_handler') 
  AND profiles.is_active = true
));

CREATE POLICY "Public can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published' AND published_at <= now());

-- RLS policies for blog_categories
CREATE POLICY "Organization admins can manage blog categories" 
ON public.blog_categories 
FOR ALL 
USING (organization_id IN (
  SELECT profiles.organization_id 
  FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'org_admin') 
  AND profiles.is_active = true
));

CREATE POLICY "Public can view blog categories"
ON public.blog_categories
FOR SELECT
USING (true);

-- RLS policies for blog_post_categories
CREATE POLICY "Organization members can manage post categories" 
ON public.blog_post_categories 
FOR ALL 
USING (post_id IN (
  SELECT bp.id 
  FROM blog_posts bp 
  JOIN profiles p ON p.organization_id = bp.organization_id
  WHERE p.id = auth.uid() 
  AND p.role IN ('admin', 'org_admin', 'case_handler') 
  AND p.is_active = true
));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for landing page
INSERT INTO public.page_content (organization_id, page_identifier, section_key, content, content_type) VALUES
-- We'll need to get actual organization IDs, but this shows the structure
-- These will be organization-specific defaults
('00000000-0000-0000-0000-000000000000', 'landing_hero', 'title', 'Secure Whistleblowing & Compliance Reporting', 'text'),
('00000000-0000-0000-0000-000000000000', 'landing_hero', 'subtitle', 'Enable anonymous reporting with enterprise-grade security and full regulatory compliance', 'text'),
('00000000-0000-0000-0000-000000000000', 'landing_hero', 'cta_text', 'Start Free Trial', 'text'),
('00000000-0000-0000-0000-000000000000', 'landing_features', 'section_title', 'Everything you need for secure reporting', 'text')
ON CONFLICT (organization_id, page_identifier, section_key) DO NOTHING;