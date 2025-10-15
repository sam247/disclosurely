-- Create seo_settings table for page-specific SEO configuration
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  page_identifier TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'en',
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
  robots_directive TEXT DEFAULT 'index,follow',
  structured_data JSONB,
  custom_head_tags TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, page_identifier, language_code)
);

-- Create global_seo_settings table for site-wide defaults
CREATE TABLE IF NOT EXISTS public.global_seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  site_name TEXT,
  site_description TEXT,
  default_meta_title TEXT,
  default_meta_description TEXT,
  default_og_image_url TEXT,
  default_twitter_image_url TEXT,
  favicon_url TEXT,
  logo_url TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  facebook_pixel_id TEXT,
  custom_head_tags TEXT,
  is_active BOOLEAN DEFAULT true,
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

-- Create indexes for better query performance
CREATE INDEX idx_seo_settings_org_page ON public.seo_settings(organization_id, page_identifier, language_code);
CREATE INDEX idx_global_seo_settings_org ON public.global_seo_settings(organization_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_seo_settings_updated_at
  BEFORE UPDATE ON public.global_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();