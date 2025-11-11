import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Palette, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  logo_url: string | null;
  brand_color: string | null;
}

const OrganizationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, [user]);

  useEffect(() => {
    if (organization?.brand_color) {
      setBrandColor(organization.brand_color);
    }
    if (organization?.logo_url) {
      setLogoPreview(organization.logo_url);
    }
  }, [organization]);

  const fetchOrganization = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: orgData, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (error) throw error;

      setOrganization(orgData);
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive",
      });
    }
  };

  const handleBrandColorChange = async (color: string) => {
    if (!user || !organization) return;

    setBrandColor(color);
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ brand_color: color })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Brand color updated successfully",
      });
    } catch (error) {
      console.error('Error updating brand color:', error);
      toast({
        title: "Error",
        description: "Failed to update brand color",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOrganization = async () => {
    if (!organization) return;

    setIsSubmitting(true);
    try {
      let logoUrl = organization.logo_url;

      // Upload logo if a new file is selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${organization.id}/logo.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('organization-logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('organization-logos')
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      }

      // Update organization with name, logo, and branding
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          logo_url: logoUrl,
          brand_color: brandColor,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });

      // Refresh organization data
      await fetchOrganization();
      setLogoFile(null);
    } catch (error) {
      console.error('Error saving organization:', error);
      toast({
        title: "Error",
        description: "Failed to save organization settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) {
    return <div className="p-6">Loading organization settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={organization.name}
              onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              placeholder="Enter organization name"
              className="max-w-md"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Organization Logo</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {logoPreview && (
                <div className="w-16 h-16 border rounded-lg overflow-hidden shrink-0">
                  <img
                    src={logoPreview}
                    alt="Organization logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 max-w-md">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full"
                />
                <p className="text-sm text-muted-foreground mt-1 break-words">
                  Upload a logo (max 2MB, PNG/JPG recommended)
                </p>
              </div>
            </div>
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="brand-color">Brand Color</Label>
            <div className="flex items-center gap-3 max-w-md">
              <Input
                id="brand-color"
                type="color"
                value={brandColor}
                onChange={(e) => handleBrandColorChange(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={brandColor}
                onChange={(e) => handleBrandColorChange(e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This color will be used throughout your organization's interface
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveOrganization}
              loading={isSubmitting}
              loadingText="Saving..."
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSettings;