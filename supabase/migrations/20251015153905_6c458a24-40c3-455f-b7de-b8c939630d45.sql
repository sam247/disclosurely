-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS public.seo_settings CASCADE;
DROP TABLE IF EXISTS public.global_seo_settings CASCADE;

-- Create seo_settings table matching component expectations
CREATE TABLE public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  page_identifier TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  robots_txt TEXT,
  sitemap_xml TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  facebook_pixel_id TEXT,
  structured_data_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, page_identifier, lang)
);

-- Create global_seo_settings table matching component expectations
CREATE TABLE public.global_seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  default_meta_title TEXT,
  default_meta_description TEXT,
  default_og_image TEXT,
  default_twitter_image TEXT,
  global_robots_txt TEXT,
  global_sitemap_xml TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  facebook_pixel_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seo_settings
CREATE POLICY "Organization members can view SEO settings"
  ON public.seo_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Organization admins can manage SEO settings"
  ON public.seo_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'org_admin')
        AND is_active = true
    )
  );

-- RLS Policies for global_seo_settings
CREATE POLICY "Organization members can view global SEO settings"
  ON public.global_seo_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Organization admins can manage global SEO settings"
  ON public.global_seo_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'org_admin')
        AND is_active = true
    )
  );

-- Create indexes
CREATE INDEX idx_seo_settings_org_page ON public.seo_settings(organization_id, page_identifier, lang);
CREATE INDEX idx_global_seo_settings_org ON public.global_seo_settings(organization_id);

-- Add update triggers
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_seo_settings_updated_at
  BEFORE UPDATE ON public.global_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();