
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganization();
    fetchDomains();
  }, [user]);

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
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: domainsData, error } = await supabase
        .from('domain_verifications')
        .select('*')
        .eq('organization_id', profile.organization_id);

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

    if (!organization) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullSubdomain = `${subdomainName}.disclosurely.com`;
      
      // Check if subdomain already exists for this organization
      const existingDomain = domains.find(d => d.domain === fullSubdomain);
      if (existingDomain) {
        toast({
          title: "Error",
          description: "This subdomain is already configured for your organization",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if subdomain exists globally
      const { data: globalCheck } = await supabase
        .from('domain_verifications')
        .select('domain')
        .eq('domain', fullSubdomain)
        .single();

      if (globalCheck) {
        toast({
          title: "Error",
          description: "This subdomain is already taken",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
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
      toast({
        title: "Error",
        description: error.message || "Failed to set up subdomain",
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

      {/* Branded Subdomain Settings */}
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
