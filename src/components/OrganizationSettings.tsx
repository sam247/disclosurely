import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Upload, Palette } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  logo_url: string | null;
  brand_color: string | null;
}

interface DomainVerification {
  id: string;
  organization_id: string;
  domain: string;
  verification_type: string;
  verification_token: string | null;
  verified_at: string | null;
  created_at: string;
}

const OrganizationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [domains, setDomains] = useState<DomainVerification[]>([]);
  const [subdomainName, setSubdomainName] = useState('');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganization();
    fetchDomains();
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

      const { data: organizationData, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (error) throw error;

      setOrganization(organizationData);
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive",
      });
    }
  };

  const fetchDomains = async () => {
    if (!organization) return;

    try {
      const { data: domainsData, error } = await supabase
        .from('domain_verifications')
        .select('*')
        .eq('organization_id', organization.id);

      if (error) throw error;

      setDomains(domainsData || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast({
        title: "Error",
        description: "Failed to load domain settings",
        variant: "destructive",
      });
    }
  };

  const handleSubdomainSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subdomainName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subdomain name",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(subdomainName)) {
      toast({
        title: "Error", 
        description: "Subdomain can only contain lowercase letters, numbers, and hyphens",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullSubdomain = `${subdomainName}.disclosurely.com`;
      
      // Check if subdomain already exists
      const { data: existingDomain, error: checkError } = await supabase
        .from('domain_verifications')
        .select('id')
        .eq('domain', fullSubdomain)
        .single();

      if (existingDomain) {
        toast({
          title: "Error",
          description: "This subdomain is already taken. Please choose a different one.",
          variant: "destructive",
        });
        return;
      }

      // Only proceed if no existing domain found (ignore "PGRST116" error which means no rows found)
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      const { error } = await supabase
        .from('domain_verifications')
        .insert({
          organization_id: organization.id,
          domain: fullSubdomain,
          verification_type: 'SUBDOMAIN',
          verification_token: 'auto-verified-subdomain',
          verified_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subdomain ${fullSubdomain} has been set up successfully!`,
      });

      setSubdomainName('');
      fetchDomains();
    } catch (error: any) {
      console.error('Subdomain setup error:', error);
      let errorMessage = "Failed to set up subdomain";
      
      if (error.code === '23505') {
        errorMessage = "This subdomain is already taken. Please choose a different one.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('domain_verifications')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Domain removed successfully",
      });

      fetchDomains();
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to remove domain",
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

  const handleSaveBranding = async () => {
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

      // Update organization with new branding
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          logo_url: logoUrl,
          brand_color: brandColor,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Branding settings updated successfully",
      });

      // Refresh organization data
      fetchOrganization();
      setLogoFile(null);
    } catch (error: any) {
      console.error('Error updating branding:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update branding settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          logo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) throw error;

      // Remove from storage if it exists
      if (organization.logo_url) {
        const fileName = `${organization.id}/logo.png`;
        await supabase.storage
          .from('organization-logos')
          .remove([fileName]);
      }

      toast({
        title: "Success",
        description: "Logo removed successfully",
      });

      setLogoPreview(null);
      setLogoFile(null);
      fetchOrganization();
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove logo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Settings</h3>
        <p className="text-sm text-gray-600">
          Manage your organization's profile and domain settings
        </p>
      </div>

      {/* Basic Information */}
      {organization && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your organization's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input type="text" value={organization.name} readOnly />
            </div>
            <div>
              <Label>Description</Label>
              <Input type="text" value={organization.description || 'N/A'} readOnly />
            </div>
            <div>
              <Label>Created At</Label>
              <Input type="text" value={new Date(organization.created_at).toLocaleDateString()} readOnly />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branding Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
          <CardDescription>
            Customize your organization's branding for submission forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Organization Logo</Label>
            <div className="flex items-center space-x-4">
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Organization logo" 
                    className="w-16 h-16 object-contain border rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-auto"
                />
                <p className="text-xs text-gray-500">
                  Upload a logo (max 2MB, PNG/JPG recommended)
                </p>
              </div>
            </div>
          </div>

          {/* Brand Color */}
          <div className="space-y-4">
            <Label>Brand Color</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 text-gray-500" />
                <Input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-24 font-mono text-sm"
                  placeholder="#2563eb"
                />
              </div>
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: brandColor }}
              />
            </div>
            <p className="text-xs text-gray-500">
              This color will be used for buttons and accents in your submission forms
            </p>
          </div>

          <Button 
            onClick={handleSaveBranding}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : 'Save Branding Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Custom Domain Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Branded Subdomain</CardTitle>
          <CardDescription>
            Set up a branded subdomain for your organization's submission portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subdomain Setup */}
          <form onSubmit={handleSubdomainSetup} className="space-y-4">
            <div>
              <Label htmlFor="subdomain">Choose Your Subdomain</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="subdomain"
                  value={subdomainName}
                  onChange={(e) => setSubdomainName(e.target.value.toLowerCase())}
                  placeholder="yourorg"
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">.disclosurely.com</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This will be your branded URL for report submissions
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Setting up...' : 'Set up Subdomain'}
            </Button>
          </form>

          {/* Current Domains */}
          {domains && domains.length > 0 && (
            <div className="space-y-3">
              <Label>Current Domains</Label>
              {domains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{domain.domain}</p>
                    <p className="text-sm text-gray-600">
                      {domain.verification_type === 'SUBDOMAIN' ? 'Branded Subdomain' : 'Custom Domain'} • 
                      {domain.verified_at ? (
                        <span className="text-green-600 ml-1">✓ Verified</span>
                      ) : (
                        <span className="text-orange-600 ml-1">⏳ Pending</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDomain(domain.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
