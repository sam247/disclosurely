
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2 } from 'lucide-react';
import CustomDomainSettings from './CustomDomainSettings';

const OrganizationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');

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

  const handleSaveBasicInfo = () => {
    updateOrganizationMutation.mutate({
      name: organizationName || organization?.name,
      description: organizationDescription || organization?.description,
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Check for Tier 2 subscription (placeholder - you'll need to implement actual subscription checking)
  const hasActiveTier2Subscription = true; // This should be replaced with actual subscription check

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
      <CustomDomainSettings hasActiveTier2Subscription={hasActiveTier2Subscription} />
    </div>
  );
};

export default OrganizationSettings;
