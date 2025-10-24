import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useTranslation } from 'react-i18next';
import { Info, ExternalLink } from 'lucide-react';

interface OrganizationLink {
  id: string;
  name: string;
  link_token: string;
  is_active: boolean;
  usage_count: number | null;
  created_at: string;
}

const LinkGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const limits = useSubscriptionLimits();

  // Fetch active custom domains
  const { data: customDomains } = useQuery({
    queryKey: ['custom-domains'],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return [];

      const { data: domains } = await supabase
        .from('custom_domains')
        .select('domain_name, is_active, is_primary, status')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .eq('status', 'active');

      return domains || [];
    },
    enabled: !!user,
  });

  // Get the primary domain (prefer primary custom domain)
  const primaryDomain = customDomains?.find(d => d.is_primary)?.domain_name || null;

  // Fetch the primary active link
  const { data: primaryLink, isLoading } = useQuery({
    queryKey: ['primary-link'],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return null;

      const { data: links } = await supabase
        .from('organization_links')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      return links?.[0] || null;
    },
    enabled: !!user,
  });

  // Toggle link active status
  const toggleLinkMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase
        .from('organization_links')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['primary-link'] });
      toast({
        title: t('linkCopied'),
        description: t('linkCopiedDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateLinkUrl = (linkToken: string) => {
    if (primaryDomain) {
      return `https://${primaryDomain}/secure/tool/submit/${linkToken}`;
    }
    return `${window.location.origin}/secure/tool/submit/${linkToken}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('linkCopied'),
      description: t('linkCopiedDescription'),
    });
  };

  const handleToggleLink = () => {
    if (primaryLink) {
      toggleLinkMutation.mutate({ 
        id: primaryLink.id, 
        is_active: !primaryLink.is_active 
      });
    }
  };

  if (isLoading || !primaryLink) {
    return null;
  }

  const linkUrl = generateLinkUrl(primaryLink.link_token);
  const isBranded = !!primaryDomain;
  const portalType = isBranded ? t('brandedSubmissionPortal') : t('unbrandedSubmissionPortal');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('secureReportLink')}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {t('yourOrganisationCanUse')}
            </CardDescription>
          </div>
          <Badge variant={primaryLink.is_active ? "default" : "secondary"}>
            {primaryLink.is_active ? t('active') : t('inactive')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">{portalType}</p>
            <p className="text-xs text-muted-foreground">
              {t('usedTimes', { count: primaryLink.usage_count || 0 })}
            </p>
            {/* Show full URL for better guidance */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Your secure link URL:</p>
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono break-all">
                {linkUrl}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <code className="text-sm bg-background px-3 py-1.5 rounded border font-mono">
              /{primaryLink.link_token}
            </code>
            <Button
              size="sm"
              onClick={() => copyToClipboard(linkUrl)}
              className="whitespace-nowrap"
            >
              {t('copyLink')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Custom Domain Information */}
    {primaryDomain && (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Custom Domain Active:</strong> Your secure links now use <code className="bg-muted px-1 rounded">{primaryDomain}</code> instead of the default domain. 
          Make sure this domain is properly configured in your DNS provider and Vercel project settings.
        </AlertDescription>
      </Alert>
    )}

    {/* How Custom Domains Work */}
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">How Custom Domains Work</CardTitle>
        <CardDescription>
          Understanding how your secure links are structured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Default Setup:</h4>
          <code className="block bg-muted p-2 rounded text-sm">
            https://secure.disclosurely.com/secure/tool/submit/{primaryLink.link_token}
          </code>
        </div>
        
        {primaryDomain ? (
          <div className="space-y-2">
            <h4 className="font-medium">With Your Custom Domain:</h4>
            <code className="block bg-muted p-2 rounded text-sm">
              https://{primaryDomain}/secure/tool/submit/{primaryLink.link_token}
            </code>
            <p className="text-sm text-muted-foreground">
              Your custom domain replaces the default domain entirely. The path structure remains the same.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium">To Use a Custom Domain:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>1. Go to <a href="/dashboard/settings" className="text-blue-600 hover:underline">Settings → Custom Domains</a></li>
              <li>2. Add your domain (e.g., secure.yourcompany.com)</li>
              <li>3. Set up DNS CNAME record pointing to secure.disclosurely.com</li>
              <li>4. Verify and activate the domain</li>
              <li>5. Set it as primary to use for all secure links</li>
            </ol>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> Custom domains must be added to your Vercel project settings to work properly. 
            Contact support if you need help with domain configuration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkGenerator;
