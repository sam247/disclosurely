import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auditLogger } from '@/utils/auditLogger';

interface OrganizationLink {
  id: string;
  name: string;
  link_token: string;
  is_active: boolean;
  usage_count: number | null;
  created_at: string;
  default_language?: string;
}

interface CustomDomainRecord {
  id: string;
  domain_name: string;
  status: string;
  is_active: boolean;
  is_primary: boolean;
  activated_at?: string | null;
  verified_at?: string | null;
  last_checked_at?: string | null;
  created_at?: string | null;
}

const LinkGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch custom domains via edge function (handles RLS/service role logic)
  const { data: customDomains = [], refetch: refetchDomains } = useQuery<CustomDomainRecord[]>({
    queryKey: ['custom-domains', user?.id],
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 0, // Don't cache - always fetch fresh
    queryFn: async () => {
      if (!user) {
        console.log('🔍 LinkGenerator: No user, returning empty domains');
        return [];
      }

      const { data: { session } } = await supabase.auth.getSession();

      const response = await supabase.functions.invoke('simple-domain-v2', {
        body: { action: 'list-domains' },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (response.error) {
        console.error('🔍 LinkGenerator: list-domains edge function error:', response.error);
        return [];
      }

      const result = response.data;
      if (result?.success) {
        console.log('🔍 LinkGenerator: Domains fetched from edge function:', result.domains);
        return (result.domains || []) as CustomDomainRecord[];
      }

      console.warn('🔍 LinkGenerator: list-domains returned without success', result);
      return [];
    },
  });

  // Listen for domain verification events to immediately refetch
  useEffect(() => {
    const handleDomainVerified = () => {
      console.log('Domain verified event received, refetching custom domains...');
      refetchDomains();
      // Also invalidate the query cache
      queryClient.invalidateQueries({ queryKey: ['custom-domains', user?.id] });
    };

    window.addEventListener('custom-domain-verified', handleDomainVerified);
    return () => {
      window.removeEventListener('custom-domain-verified', handleDomainVerified);
    };
  }, [refetchDomains, queryClient, user?.id]);

  // Determine primary domain from domain list
  const activeDomains = (customDomains || []).filter((domain) => domain.is_active);
  const primaryDomainRecord =
    activeDomains.find((domain) => domain.is_primary && domain.status === 'active') ||
    activeDomains.find((domain) => domain.is_primary) ||
    activeDomains.find((domain) => domain.status === 'active') ||
    activeDomains[0] ||
    (customDomains || [])[0];

  const primaryDomain = primaryDomainRecord?.domain_name ?? null;
  const primaryDomainStatus = primaryDomainRecord?.status ?? null;

  // Fetch organization info for subdomain
  const { data: organizationInfo } = useQuery({
    queryKey: ['organization-info', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return null;

      const { data: org } = await supabase
        .from('organizations')
        .select('id, domain, name')
        .eq('id', profile.organization_id)
        .single();

      return org;
    },
    enabled: !!user,
  });

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

  // Update default language
  const updateLanguageMutation = useMutation({
    mutationFn: async ({ id, default_language }: { id: string, default_language: string }) => {
      const { error } = await supabase
        .from('organization_links')
        .update({ default_language })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['primary-link'] });
      toast({
        title: "Language Updated",
        description: "Default form language has been updated successfully.",
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
      return `https://${primaryDomain}/report`;
    }
    // Always use secure.disclosurely.com for default (never app.disclosurely.com)
    // Keep token-based for default domain since it doesn't have custom domain detection
    return `https://secure.disclosurely.com/secure/tool/submit/${linkToken}`;
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

  // State for checking if branded link is accessible - MUST be before early returns (React rules)
  const [brandedLinkStatus, setBrandedLinkStatus] = useState<'checking' | 'accessible' | 'inaccessible' | null>(null);
  
  // Generate branded URL if we have primary domain and link - use clean URL
  const brandedUrl = primaryDomain && primaryLink
    ? `https://${primaryDomain}/report`
    : null;

  // Debug logging - MUST be after primaryLink is defined
  useEffect(() => {
    if (user) {
      console.log('🔍 LinkGenerator Debug:', {
        customDomains,
        primaryDomain,
        brandedUrl: primaryDomain && primaryLink ? `https://${primaryDomain}/report` : null,
        user: user.id
      });
    }
  }, [customDomains, primaryDomain, primaryLink, user, brandedUrl]);
  
  // Check if branded link is actually accessible via edge function
  useEffect(() => {
    let isCancelled = false;

    async function runAccessibilityCheck() {
      if (brandedUrl && primaryDomain && user && primaryLink) {
        setBrandedLinkStatus('checking');

        const { data: { session } } = await supabase.auth.getSession();

        try {
          const response = await supabase.functions.invoke('simple-domain-v2', {
            body: {
              action: 'check-accessibility',
              domain: primaryDomain,
              linkToken: primaryLink.link_token
            },
            headers: session?.access_token ? {
              Authorization: `Bearer ${session.access_token}`
            } : undefined
          });

          if (response.error) {
            console.error('Domain check error:', response.error);
            const primaryDomainData = customDomains?.find(d => d.domain_name === primaryDomain && d.is_active && d.status === 'active');
            if (!isCancelled) {
              setBrandedLinkStatus(primaryDomainData ? 'accessible' : 'inaccessible');
            }
            return;
          }

          const result = response.data;
          if (!isCancelled) {
            if (result.accessible) {
              setBrandedLinkStatus('accessible');
              if (user?.id && result.organizationId) {
                auditLogger.log({
                  eventType: 'custom_domain.checked',
                  category: 'system',
                  action: 'check_branded_link_accessibility',
                  actorType: 'user',
                  actorId: user.id,
                  organizationId: result.organizationId,
                  summary: `Branded link accessibility checked for ${primaryDomain}`,
                  metadata: { domain: primaryDomain, accessible: true }
                }).catch(console.error);
              }
            } else {
              setBrandedLinkStatus('inaccessible');
            }
          }
        } catch (error) {
          console.error('Domain accessibility check failed:', error);
          const primaryDomainData = customDomains?.find(d => d.domain_name === primaryDomain && d.is_active && d.status === 'active');
          if (!isCancelled) {
            setBrandedLinkStatus(primaryDomainData ? 'accessible' : 'checking');
          }
        }
      } else {
        setBrandedLinkStatus(null);
      }
    }

    runAccessibilityCheck();

    return () => {
      isCancelled = true;
    };
  }, [brandedUrl, primaryDomain, primaryLink?.link_token, customDomains, user]);

  if (isLoading || !primaryLink) {
    return null;
  }

  // Generate subdomain URL if organization has a domain slug
  const subdomainUrl = organizationInfo?.domain
    ? `https://${organizationInfo.domain}.disclosurely.com/report`
    : null;

  // Generate token-based URL as last resort fallback
  const tokenUrl = `https://secure.disclosurely.com/secure/tool/submit/${primaryLink.link_token}`;

  return (
    <>
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
        <CardContent className="space-y-3">
          {/* Branded Link - Show if available */}
          {brandedUrl && primaryDomain && (
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">✨ Your Branded Link</p>
                    {primaryDomainStatus && primaryDomainStatus !== 'active' && (
                      <Badge variant="outline" className="text-xs h-5 capitalize shrink-0">
                        {primaryDomainStatus}
                      </Badge>
                    )}
                    {brandedLinkStatus === 'accessible' && (
                      <Badge variant="default" className="bg-green-600 text-xs h-5 shrink-0">
                        ✓ Active
                      </Badge>
                    )}
                    {brandedLinkStatus === 'checking' && (
                      <Badge variant="outline" className="text-xs h-5 shrink-0">
                        Checking DNS…
                      </Badge>
                    )}
                    {brandedLinkStatus === 'inaccessible' && (
                      <Badge variant="destructive" className="text-xs h-5 shrink-0">
                        ⚠ Needs attention
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 break-words">
                    Clean, professional URL for your employees • Used {primaryLink.usage_count || 0} times
                  </p>
                  <code className="text-xs sm:text-sm bg-background px-3 py-2 rounded border font-mono break-all block w-full font-semibold">
                    {brandedUrl}
                  </code>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(brandedUrl)}
                  className="whitespace-nowrap shrink-0 w-full sm:w-auto"
                  disabled={brandedLinkStatus === 'inaccessible'}
                >
                  {t('copyLink')}
                </Button>
              </div>
            </div>
          )}

          {/* Subdomain Link - Show if available */}
          {subdomainUrl && (
            <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">🏢 Your Subdomain Link</p>
                    <Badge variant="default" className="bg-green-600 text-xs h-5 shrink-0">
                      ✓ Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 break-words">
                    {brandedUrl
                      ? `Fallback option when custom domain is unavailable • Used ${primaryLink.usage_count || 0} times`
                      : `Professional branded link • Used ${primaryLink.usage_count || 0} times`
                    }
                  </p>
                  <code className="text-xs sm:text-sm bg-background px-3 py-2 rounded border font-mono break-all block w-full font-semibold">
                    {subdomainUrl}
                  </code>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(subdomainUrl)}
                  className="whitespace-nowrap shrink-0 w-full sm:w-auto"
                >
                  {t('copyLink')}
                </Button>
              </div>
            </div>
          )}

          {/* Token-based Link - Show as last resort */}
          <div className="p-3 bg-gray-50 rounded-lg border border-dashed">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">Legacy Link (for testing only)</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2 break-words">
                  This link works but is not as professional. Use the links above for production.
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded border font-mono break-all block w-full">
                  {tokenUrl}
                </code>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(tokenUrl)}
                className="whitespace-nowrap shrink-0 w-full sm:w-auto text-xs"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Prompt to set up custom domain if they don't have one */}
          {!brandedUrl && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-muted-foreground break-words">
                <strong>💡 Want an even more professional link?</strong> Go to <a href="/dashboard/settings" className="text-blue-600 hover:underline font-semibold">Settings → Custom Domains</a> to use your own domain like <code className="font-semibold">yourcompany.com/report</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Form Settings</CardTitle>
          </div>
          <CardDescription className="text-sm mt-1">
            Configure the default language for your submission form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-language">Default Language</Label>
            <Select
              value={primaryLink.default_language || 'en'}
              onValueChange={(value) => {
                updateLanguageMutation.mutate({
                  id: primaryLink.id,
                  default_language: value
                });
              }}
            >
              <SelectTrigger id="default-language" className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español (Spanish)</SelectItem>
                <SelectItem value="fr">🇫🇷 Français (French)</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch (German)</SelectItem>
                <SelectItem value="pl">🇵🇱 Polski (Polish)</SelectItem>
                <SelectItem value="sv">🇸🇪 Svenska (Swedish)</SelectItem>
                <SelectItem value="no">🇳🇴 Norsk (Norwegian)</SelectItem>
                <SelectItem value="pt">🇵🇹 Português (Portuguese)</SelectItem>
                <SelectItem value="it">🇮🇹 Italiano (Italian)</SelectItem>
                <SelectItem value="nl">🇳🇱 Nederlands (Dutch)</SelectItem>
                <SelectItem value="da">🇩🇰 Dansk (Danish)</SelectItem>
                <SelectItem value="el">🇬🇷 Ελληνικά (Greek)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This sets the default language when users access your submission form. Users can still change the language within the form.
            </p>
          </div>
        </CardContent>
      </Card>

    </>
  );
};

export default LinkGenerator;
