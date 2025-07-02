
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const OrganizationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  // Fetch organization data
  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization');

      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      return org;
    },
  });

  // Update organization mutation
  const updateOrganizationMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!organization) throw new Error('No organization');

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive",
      });
    },
  });

  // Set up custom domain mutation
  const setupCustomDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      if (!organization) throw new Error('No organization');

      const { error } = await supabase
        .from('organizations')
        .update({ 
          custom_domain: domain,
          custom_domain_enabled: false // Will be enabled after verification
        })
        .eq('id', organization.id);

      if (error) throw error;

      // Create domain verification record
      const { error: verificationError } = await supabase
        .from('domain_verifications')
        .insert({
          organization_id: organization.id,
          domain: domain,
          verification_token: `disclosurely-verify-${Math.random().toString(36).substring(2, 15)}`
        });

      if (verificationError) throw verificationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast({
        title: "Custom Domain Setup Started",
        description: "Please verify your domain ownership to complete setup",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to setup custom domain",
        variant: "destructive",
      });
    },
  });

  const handleSaveBasicInfo = () => {
    updateOrganizationMutation.mutate({
      name: organizationName || organization?.name,
      description: organizationDescription || organization?.description,
    });
  };

  const handleSetupCustomDomain = () => {
    if (!customDomain) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }
    setupCustomDomainMutation.mutate(customDomain);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Organization Information</span>
          </CardTitle>
          <CardDescription>
            Manage your organization's basic information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={organizationName || organization?.name || ''}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Enter organization name"
            />
          </div>
          
          <div>
            <Label htmlFor="org-description">Description</Label>
            <Input
              id="org-description"
              value={organizationDescription || organization?.description || ''}
              onChange={(e) => setOrganizationDescription(e.target.value)}
              placeholder="Brief description of your organization"
            />
          </div>

          <Button 
            onClick={handleSaveBasicInfo}
            disabled={updateOrganizationMutation.isPending}
          >
            {updateOrganizationMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Custom Domain Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Custom Domain</span>
          </CardTitle>
          <CardDescription>
            Use your own domain for submission links and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {organization?.custom_domain ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{organization.custom_domain}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {organization.domain_verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending Verification
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Instructions
                  </Button>
                </div>
              </div>
              
              {!organization.domain_verified && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Verification Required</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    To complete your custom domain setup, please add the following DNS record:
                  </p>
                  <div className="bg-white p-3 rounded border font-mono text-sm">
                    <p><strong>Type:</strong> TXT</p>
                    <p><strong>Name:</strong> _disclosurely-verification</p>
                    <p><strong>Value:</strong> {organization.domain_verification_token}</p>
                  </div>
                  <p className="text-sm text-blue-700 mt-3">
                    Once added, verification typically takes 5-10 minutes.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-domain">Domain Name</Label>
                <Input
                  id="custom-domain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="reports.yourcompany.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the domain you want to use for your submission portal
                </p>
              </div>

              <Button 
                onClick={handleSetupCustomDomain}
                disabled={setupCustomDomainMutation.isPending}
              >
                {setupCustomDomainMutation.isPending ? 'Setting up...' : 'Setup Custom Domain'}
              </Button>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You must own the domain</li>
                  <li>• Access to DNS settings required</li>
                  <li>• Subdomain recommended (e.g., reports.yourcompany.com)</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
