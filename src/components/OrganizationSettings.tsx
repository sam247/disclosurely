import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Upload, X, Info } from 'lucide-react';
import CustomDomainSettings from './CustomDomainSettings';

const OrganizationSettings = () => {
  const { organization, refetch } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>({ subscribed: false });
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    description: organization?.description || '',
    brand_color: organization?.brand_color || '#2563eb',
  });

  // Check subscription status when component mounts
  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      setSubscriptionData(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
    }
  };

  // Check if user has active Tier 2 subscription
  const hasActiveTier2Subscription = subscriptionData.subscribed && 
    subscriptionData.subscription_tier === 'tier2';

  const handleSave = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description,
          brand_color: formData.brand_color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Organization settings have been updated successfully.",
      });

      refetch();
    } catch (error: any) {
      console.error('Error saving organization settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !organization) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}-logo-${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      // Update organization with logo URL
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          logo_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      toast({
        title: "Logo uploaded",
        description: "Your organization logo has been uploaded successfully.",
      });

      refetch();
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!organization?.logo_url) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          logo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Logo removed",
        description: "Your organization logo has been removed.",
      });

      refetch();
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter organization name"
            />
          </div>
          <div>
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your organization"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize the appearance of your submission forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brand-color">Brand Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="brand-color"
                type="color"
                value={formData.brand_color}
                onChange={(e) => handleInputChange('brand_color', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={formData.brand_color}
                onChange={(e) => handleInputChange('brand_color', e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div>
            <Label>Organization Logo</Label>
            
            {/* Image Requirements Notice */}
            <div className="mt-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Image Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use a square image (1:1 aspect ratio) for best results</li>
                    <li>Minimum size: 256×256 pixels</li>
                    <li>Recommended size: 512×512 pixels or larger</li>
                    <li>Supports JPEG, PNG, GIF, WebP formats</li>
                    <li>Maximum file size: 5MB</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Logo Display */}
              {organization?.logo_url && (
                <div className="flex items-center space-x-4">
                  <img 
                    src={organization.logo_url} 
                    alt="Current logo" 
                    className="w-16 h-16 object-contain border rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Logo
                  </Button>
                </div>
              )}

              {/* File Upload */}
              <div>
                <Label htmlFor="logo-upload" className="block text-sm font-medium mb-2">
                  Upload Logo
                </Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingLogo ? 'Uploading...' : 'Choose File'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain Settings */}
      <CustomDomainSettings hasActiveTier2Subscription={hasActiveTier2Subscription} />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationSettings;
