import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Copy, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { auditLogger } from '@/utils/auditLogger';

interface Organization {
  id: string;
  domain: string;
  active_url_type: 'subdomain' | 'custom_domain';
  custom_domain: string | null;
  custom_domain_verified: boolean;
}

const ReportingPortalUrlSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeUrlType, setActiveUrlType] = useState<'subdomain' | 'custom_domain'>('subdomain');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, [user]);

  useEffect(() => {
    if (organization) {
      setActiveUrlType(organization.active_url_type || 'subdomain');
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
        .select('id, domain, active_url_type, custom_domain, custom_domain_verified')
        .eq('id', profile.organization_id)
        .single();

      if (error) throw error;

      setOrganization(orgData as Organization);
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!organization || !user) return;

    // Validate: can't switch to custom_domain if it's not verified
    if (activeUrlType === 'custom_domain' && !organization.custom_domain_verified) {
      toast({
        title: "Cannot Switch",
        description: "Custom domain must be verified before it can be set as active.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ active_url_type: activeUrlType })
        .eq('id', organization.id);

      if (error) throw error;

      // Log the change
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        auditLogger.log({
          eventType: 'organization.url_type_changed',
          category: 'system',
          action: 'update_url_type',
          actorType: 'user',
          actorId: user.id,
          organizationId: profile.organization_id,
          summary: `Active URL type changed to: ${activeUrlType}`,
          metadata: { 
            previousType: organization.active_url_type,
            newType: activeUrlType,
            customDomain: organization.custom_domain
          }
        }).catch(console.error);
      }

      // Refresh organization data
      await fetchOrganization();

      toast({
        title: "Success",
        description: "Reporting portal URL settings updated. The old URL will automatically redirect to the new one.",
      });
    } catch (error) {
      console.error('Error updating URL type:', error);
      toast({
        title: "Error",
        description: "Failed to update URL settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
      toast({
        title: "Copied",
        description: "URL copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const subdomainUrl = `https://${organization.domain}.disclosurely.com/report`;
  const customDomainUrl = organization.custom_domain 
    ? `https://${organization.custom_domain}/report`
    : null;

  const hasChanges = activeUrlType !== organization.active_url_type;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporting Portal URL</CardTitle>
        <CardDescription>
          Choose which URL type should be active for your reporting portal. Only one can be active at a time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={activeUrlType}
          onValueChange={(value) => setActiveUrlType(value as 'subdomain' | 'custom_domain')}
        >
          {/* Standard Subdomain Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="subdomain" id="subdomain" className="mt-1" />
            <div className="flex-1 min-w-0">
              <Label htmlFor="subdomain" className="text-base font-semibold cursor-pointer">
                Standard Subdomain
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded flex-1 min-w-0 break-all">
                    {subdomainUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(subdomainUrl)}
                    className="shrink-0"
                  >
                    {copiedUrl === subdomainUrl ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your organization's subdomain on disclosurely.com
                </p>
              </div>
            </div>
          </div>

          {/* Custom Domain Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem 
              value="custom_domain" 
              id="custom_domain" 
              className="mt-1"
              disabled={!organization.custom_domain || !organization.custom_domain_verified}
            />
            <div className="flex-1 min-w-0">
              <Label 
                htmlFor="custom_domain" 
                className={`text-base font-semibold ${(!organization.custom_domain || !organization.custom_domain_verified) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Custom Domain
              </Label>
              <div className="mt-2 space-y-2">
                {!organization.custom_domain ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Not configured - Set up custom domain in Custom Domains section</span>
                  </div>
                ) : !organization.custom_domain_verified ? (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Pending verification - Domain must be verified before it can be activated</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1 min-w-0 break-all">
                        {customDomainUrl}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => customDomainUrl && copyToClipboard(customDomainUrl)}
                        className="shrink-0"
                        disabled={!customDomainUrl}
                      >
                        {copiedUrl === customDomainUrl ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Domain verified and ready to use</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </RadioGroup>

        {/* Warning Message */}
        {hasChanges && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Switching will automatically redirect the old URL to the new one using a 301 permanent redirect. 
              This ensures all existing links continue to work while directing users to the active URL.
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={isSaving}
            loadingText="Saving..."
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportingPortalUrlSettings;

