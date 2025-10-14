-- Create SEO settings table for managing page meta tags, titles, and SEO configuration
CREATE TABLE public.seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  page_identifier TEXT NOT NULL, -- e.g., 'landing', 'pricing', 'about', 'contact', 'features', 'careers', 'blog'
  language_code TEXT NOT NULL DEFAULT 'en', -- Language code for multilingual SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  canonical_url TEXT,
  robots_directive TEXT DEFAULT 'index,follow', -- robots meta tag content
  structured_data JSONB DEFAULT '{}', -- JSON-LD structured data
  custom_head_tags TEXT, -- Additional custom head tags (HTML)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, page_identifier, language_code)
);

-- Create global SEO settings table for site-wide configuration
CREATE TABLE public.global_seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  site_description TEXT,
  default_meta_title TEXT,
  default_meta_description TEXT,
  default_og_image_url TEXT,
  default_twitter_image_url TEXT,
  favicon_url TEXT,
  logo_url TEXT,
  robots_txt_content TEXT,
  sitemap_xml_content TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  facebook_pixel_id TEXT,
  custom_head_tags TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id)
);

-- Enable RLS on both tables
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for seo_settings
CREATE POLICY "select_seo_settings" ON public.seo_settings
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "insert_seo_settings" ON public.seo_settings
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  )
);

CREATE POLICY "update_seo_settings" ON public.seo_settings
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  )
);

CREATE POLICY "delete_seo_settings" ON public.seo_settings
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  )
);

-- Create RLS policies for global_seo_settings
CREATE POLICY "select_global_seo_settings" ON public.global_seo_settings
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "insert_global_seo_settings" ON public.global_seo_settings
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  )
);

CREATE POLICY "update_global_seo_settings" ON public.global_seo_settings
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  )
);

CREATE POLICY "delete_global_seo_settings" ON public.global_seo_settings
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_seo_settings_organization_page ON public.seo_settings(organization_id, page_identifier);
CREATE INDEX idx_seo_settings_language ON public.seo_settings(language_code);
CREATE INDEX idx_global_seo_settings_organization ON public.global_seo_settings(organization_id);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER global_seo_settings_updated_at
  BEFORE UPDATE ON public.global_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
