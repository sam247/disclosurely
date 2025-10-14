import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, FileText, Search, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface SEOSettings {
  id?: string;
  page_identifier: string;
  lang: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots_txt?: string;
  sitemap_xml?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  facebook_pixel_id?: string;
  structured_data_json?: any;
}

interface GlobalSEOSettings {
  id?: string;
  default_meta_title?: string;
  default_meta_description?: string;
  default_og_image?: string;
  default_twitter_image?: string;
  global_robots_txt?: string;
  global_sitemap_xml?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  facebook_pixel_id?: string;
}

const PAGES = [
  { value: 'landing', label: 'Landing Page' },
  { value: 'pricing', label: 'Pricing Page' },
  { value: 'about', label: 'About Page' },
  { value: 'features', label: 'Features Page' },
  { value: 'careers', label: 'Careers Page' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'blog', label: 'Blog Page' },
  { value: 'terms', label: 'Terms of Service' },
  { value: 'privacy', label: 'Privacy Policy' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pl', label: 'Polish' },
  { value: 'sv', label: 'Swedish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'da', label: 'Danish' },
  { value: 'el', label: 'Greek' },
];

export const SEOSettings = () => {
  const { toast } = useToast();
  const { profile } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState('landing');
  const [selectedLang, setSelectedLang] = useState('en');
  const [globalSettings, setGlobalSettings] = useState<GlobalSEOSettings>({});
  const [pageSettings, setPageSettings] = useState<SEOSettings>({
    page_identifier: 'landing',
    lang: 'en',
  });

  useEffect(() => {
    loadGlobalSettings();
  }, []);

  useEffect(() => {
    if (selectedPage && selectedLang) {
      loadPageSettings(selectedPage, selectedLang);
    }
  }, [selectedPage, selectedLang]);

  const loadGlobalSettings = async () => {
    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('global_seo_settings')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();

      if (error) {
        console.error('Error loading global SEO settings:', error);
        setLoading(false);
        return;
      }

      setGlobalSettings(data || {});
    } catch (error) {
      console.error('Error loading global SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPageSettings = async (page: string, lang: string) => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('page_identifier', page)
        .eq('lang', lang)
        .maybeSingle();

      if (error) {
        console.error('Error loading page SEO settings:', error);
        return;
      }

      setPageSettings(data || {
        page_identifier: page,
        lang: lang,
      });
    } catch (error) {
      console.error('Error loading page SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGlobalSettings = async () => {
    if (!profile?.organization_id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('global_seo_settings')
        .upsert({
          organization_id: profile.organization_id,
          ...globalSettings,
        });

      if (error) throw error;

      toast({
        title: "Global SEO Settings Saved",
        description: "Your global SEO settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving global SEO settings:', error);
      toast({
        title: "Error",
        description: "Failed to save global SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePageSettings = async () => {
    if (!profile?.organization_id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          organization_id: profile.organization_id,
          ...pageSettings,
        });

      if (error) throw error;

      toast({
        title: "Page SEO Settings Saved",
        description: "Your page SEO settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving page SEO settings:', error);
      toast({
        title: "Error",
        description: "Failed to save page SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateSitemap = async () => {
    try {
      // Generate sitemap content
      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://disclosurely.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://disclosurely.com/pricing</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://disclosurely.com/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://disclosurely.com/features</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://disclosurely.com/careers</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://disclosurely.com/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://disclosurely.com/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

      // Update global sitemap
      await supabase
        .from('global_seo_settings')
        .upsert({
          organization_id: profile?.organization_id,
          global_sitemap_xml: sitemapContent,
        });

      toast({
        title: "Sitemap Generated",
        description: "Sitemap.xml has been updated with current pages.",
      });
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGlobalInputChange = (field: keyof GlobalSEOSettings, value: string) => {
    setGlobalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePageInputChange = (field: keyof SEOSettings, value: string) => {
    setPageSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Page & Language Selection</CardTitle>
          <CardDescription>
            Select the page and language you want to configure SEO settings for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page">Page</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {PAGES.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global SEO Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Global SEO Settings</CardTitle>
              <CardDescription>
                Default settings applied across all pages
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
              <Input
                id="defaultMetaTitle"
                value={globalSettings.default_meta_title || ''}
                onChange={(e) => handleGlobalInputChange('default_meta_title', e.target.value)}
                placeholder="Default site title"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
              <Textarea
                id="defaultMetaDescription"
                value={globalSettings.default_meta_description || ''}
                onChange={(e) => handleGlobalInputChange('default_meta_description', e.target.value)}
                placeholder="Default site description"
                maxLength={160}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
              <Input
                id="googleAnalytics"
                value={globalSettings.google_analytics_id || ''}
                onChange={(e) => handleGlobalInputChange('google_analytics_id', e.target.value)}
                placeholder="GA-XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleTagManager">Google Tag Manager ID</Label>
              <Input
                id="googleTagManager"
                value={globalSettings.google_tag_manager_id || ''}
                onChange={(e) => handleGlobalInputChange('google_tag_manager_id', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
              <Input
                id="facebookPixel"
                value={globalSettings.facebook_pixel_id || ''}
                onChange={(e) => handleGlobalInputChange('facebook_pixel_id', e.target.value)}
                placeholder="XXXXXXXXXXXXXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="globalRobotsTxt">Global Robots.txt</Label>
            <Textarea
              id="globalRobotsTxt"
              value={globalSettings.global_robots_txt || ''}
              onChange={(e) => handleGlobalInputChange('global_robots_txt', e.target.value)}
              placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/&#10;Disallow: /dashboard/"
              rows={6}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={saveGlobalSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Global Settings'}
            </Button>
            <Button onClick={generateSitemap} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Sitemap
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Page-Specific SEO Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Page-Specific SEO Settings</CardTitle>
              <CardDescription>
                SEO settings for {PAGES.find(p => p.value === selectedPage)?.label} ({LANGUAGES.find(l => l.value === selectedLang)?.label})
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={pageSettings.meta_title || ''}
                onChange={(e) => handlePageInputChange('meta_title', e.target.value)}
                placeholder="Page title"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {(pageSettings.meta_title || '').length}/60 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={pageSettings.meta_description || ''}
                onChange={(e) => handlePageInputChange('meta_description', e.target.value)}
                placeholder="Page description"
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {(pageSettings.meta_description || '').length}/160 characters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ogTitle">Open Graph Title</Label>
              <Input
                id="ogTitle"
                value={pageSettings.og_title || ''}
                onChange={(e) => handlePageInputChange('og_title', e.target.value)}
                placeholder="OG title for social sharing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogDescription">Open Graph Description</Label>
              <Textarea
                id="ogDescription"
                value={pageSettings.og_description || ''}
                onChange={(e) => handlePageInputChange('og_description', e.target.value)}
                placeholder="OG description for social sharing"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input
              id="canonicalUrl"
              value={pageSettings.canonical_url || ''}
              onChange={(e) => handlePageInputChange('canonical_url', e.target.value)}
              placeholder="https://disclosurely.com/page"
            />
          </div>

          <Button onClick={savePageSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Page Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};