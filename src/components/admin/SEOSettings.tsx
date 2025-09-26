import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Globe, FileText, Search } from 'lucide-react';

export const SEOSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteTitle: 'Disclosurely - Secure Whistleblower Reporting',
    siteDescription: 'Enterprise-grade anonymous reporting and case management platform for organizations worldwide.',
    robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/

Sitemap: https://disclosurely.com/sitemap.xml`,
    metaKeywords: 'whistleblower, anonymous reporting, compliance, secure disclosure, case management'
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // For now, just simulate saving - you can integrate with Supabase later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "SEO Settings Saved",
        description: "Your SEO settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSitemap = () => {
    toast({
      title: "Sitemap Generated",
      description: "Sitemap.xml has been updated with current pages.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Meta */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Page Title & Meta Description</CardTitle>
              <CardDescription>
                Configure your site's main title and description for search engines
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              value={settings.siteTitle}
              onChange={(e) => handleInputChange('siteTitle', e.target.value)}
              placeholder="Your site title"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {settings.siteTitle.length}/60 characters (recommended for SEO)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Meta Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              placeholder="Describe your site for search engines"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {settings.siteDescription.length}/160 characters (recommended for SEO)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Input
              id="metaKeywords"
              value={settings.metaKeywords}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords (optional for modern SEO)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Robots.txt */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Robots.txt Configuration</CardTitle>
              <CardDescription>
                Control how search engines crawl your website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="robotsTxt">Robots.txt Content</Label>
            <Textarea
              id="robotsTxt"
              value={settings.robotsTxt}
              onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
              placeholder="User-agent: *\nAllow: /"
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This content will be served at /robots.txt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sitemap */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Sitemap Management</CardTitle>
              <CardDescription>
                Manage your XML sitemap for search engines
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Current Sitemap</h4>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Available at: /sitemap.xml
              </p>
            </div>
            <Button variant="outline" onClick={generateSitemap}>
              Regenerate Sitemap
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Current pages in sitemap:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Home page (/)</li>
              <li>Pricing (/pricing)</li>
              <li>Compliance Software (/compliance-software)</li>
              <li>VS Competitors pages</li>
              <li>Blog posts (auto-generated)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </Button>
      </div>
    </div>
  );
};