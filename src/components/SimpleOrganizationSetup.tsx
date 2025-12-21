
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2 } from 'lucide-react';
import { log, LogContext } from '@/utils/logger';
import * as Sentry from '@sentry/react';

interface SimpleOrganizationSetupProps {
  onComplete: () => void;
}

const SimpleOrganizationSetup = ({ onComplete }: SimpleOrganizationSetupProps) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          domain: formData.domain.toLowerCase().replace(/\s+/g, '-'),
          description: `${formData.name} organization`
        })
        .select()
        .single();

      if (orgError) {
        // Critical setup operation - log to Sentry
        if (orgError instanceof Error) {
          Sentry.captureException(orgError, {
            tags: { component: 'SimpleOrganizationSetup', action: 'createOrganization' },
            extra: { userId: user?.id }
          });
        }
        log.error(LogContext.AUTH, 'Organization creation error', orgError instanceof Error ? orgError : new Error(String(orgError)), { userId: user?.id });
        throw orgError;
      }

      

      // Update user profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          organization_id: orgData.id,
          role: 'org_admin',
          is_active: true
        });

      if (profileError) {
        // Critical setup operation - log to Sentry
        if (profileError instanceof Error) {
          Sentry.captureException(profileError, {
            tags: { component: 'SimpleOrganizationSetup', action: 'updateProfile' },
            extra: { userId: user?.id }
          });
        }
        log.error(LogContext.AUTH, 'Profile update error during organization setup', profileError instanceof Error ? profileError : new Error(String(profileError)), { userId: user?.id });
        throw profileError;
      }

      

      toast({
        title: "Organization created!",
        description: "You can now start creating submission links.",
      });

      onComplete();
    } catch (error: any) {
      log.error(LogContext.AUTH, 'Organization setup error', error instanceof Error ? error : new Error(String(error)), { userId: user?.id });
      toast({
        title: "Setup failed",
        description: error.message || "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill with email domain suggestion
  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      domain: prev.domain || value.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Quick Setup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your organization to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Just a few quick details to set up your reporting portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <Label htmlFor="domain">Short Name (for links)</Label>
                <Input
                  id="domain"
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="acme-corp"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in your submission links
                </p>
              </div>

              <Button 
                type="submit" 
                loading={loading}
                loadingText="Creating..."
                className="w-full"
              >
                Create Organization
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleOrganizationSetup;
