import { useState, useEffect } from 'react';
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
import { auditLogger } from '@/utils/auditLogger';

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

  // Fetch active custom domains - refetch when needed
  const { data: customDomains, refetch: refetchDomains } = useQuery({
    queryKey: ['custom-domains', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🔍 LinkGenerator: No user, returning empty domains');
        return [];
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('🔍 LinkGenerator: Profile fetch error:', profileError);
        return [];
      }

      if (!profile?.organization_id) {
        console.log('🔍 LinkGenerator: No organization_id found for user');
        return [];
      }

      console.log('🔍 LinkGenerator: Fetching domains for organization:', profile.organization_id);

      // First, try to get all domains (less strict) to see what we have
      const { data: allDomains, error: allDomainsError } = await supabase
        .from('custom_domains')
        .select('domain_name, is_active, is_primary, status, organization_id')
        .eq('organization_id', profile.organization_id);

      console.log('🔍 LinkGenerator: All domains (unfiltered):', JSON.stringify(allDomains, null, 2));
      if (allDomainsError) {
        console.error('🔍 LinkGenerator: Error fetching all domains:', allDomainsError);
      }

      // Log each domain's status for debugging
      if (allDomains && allDomains.length > 0) {
        console.log('🔍 LinkGenerator: Domain status breakdown:');
        allDomains.forEach((domain: any) => {
          console.log(`  - ${domain.domain_name}: is_active=${domain.is_active}, is_primary=${domain.is_primary}, status="${domain.status}"`);
        });
      }

      // Now fetch with active filter - include both 'active' and 'verified' status
      const { data: domains, error: domainsError } = await supabase
        .from('custom_domains')
        .select('domain_name, is_active, is_primary, status')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .in('status', ['active', 'verified']);

      if (domainsError) {
        console.error('🔍 LinkGenerator: Error fetching active domains:', domainsError);
      }

      console.log('🔍 LinkGenerator: Active domains (filtered):', JSON.stringify(domains, null, 2));

      // Also try a less strict query to see what we're missing
      const { data: lessStrictDomains } = await supabase
        .from('custom_domains')
        .select('domain_name, is_active, is_primary, status')
        .eq('organization_id', profile.organization_id);

      console.log('🔍 LinkGenerator: Less strict query (any is_active or status):', JSON.stringify(lessStrictDomains, null, 2));

      // If no domains match strict filter, try less strict: include verified domains even if is_active is false
      if ((!domains || domains.length === 0) && lessStrictDomains && lessStrictDomains.length > 0) {
        console.log('🔍 LinkGenerator: No domains matched strict filter, checking for verified domains...');
        const verifiedDomains = lessStrictDomains.filter((d: any) => 
          d.status === 'verified' || d.status === 'active'
        );
        
        if (verifiedDomains.length > 0) {
          console.log('🔍 LinkGenerator: Found verified domains that aren\'t marked active:', verifiedDomains);
          // Return these with a note that they might need activation
          return verifiedDomains;
        }
      }

      return domains || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 5000, // Refetch every 5 seconds to catch domain updates quickly
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

  // Get the primary domain (prefer primary custom domain, then any active domain)
  // First try: primary + active + status active
  // Second try: primary + active (any status)
  // Third try: any active + status active
  // Fourth try: any active domain (any status)
  const primaryDomain = customDomains?.find(d => d.is_primary && d.is_active && d.status === 'active')?.domain_name 
    || customDomains?.find(d => d.is_primary && d.is_active)?.domain_name
    || customDomains?.find(d => d.is_active && d.status === 'active')?.domain_name 
    || customDomains?.find(d => d.is_active)?.domain_name
    || null;

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
    // Always use secure.disclosurely.com for default (never app.disclosurely.com)
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
  
  // Generate branded URL if we have primary domain and link
  const brandedUrl = primaryDomain && primaryLink 
    ? `https://${primaryDomain}/secure/tool/submit/${primaryLink.link_token}` 
    : null;

  // Debug logging - MUST be after primaryLink is defined
  useEffect(() => {
    if (user) {
      console.log('🔍 LinkGenerator Debug:', {
        customDomains,
        primaryDomain,
        brandedUrl: primaryDomain && primaryLink ? `https://${primaryDomain}/secure/tool/submit/${primaryLink.link_token}` : null,
        user: user.id
      });
    }
  }, [customDomains, primaryDomain, primaryLink, user, brandedUrl]);
  
  // Check if branded link is actually accessible via edge function
  useEffect(() => {
    if (brandedUrl && primaryDomain && user && primaryLink) {
      setBrandedLinkStatus('checking');
      
      // Use edge function to check domain accessibility
      supabase.functions.invoke('simple-domain', {
        body: {
          action: 'check-accessibility',
          domain: primaryDomain,
          linkToken: primaryLink.link_token
        }
      })
        .then((response) => {
          if (response.error) {
            console.error('Domain check error:', response.error);
            // If domain is active in DB, assume accessible
            const primaryDomainData = customDomains?.find(d => d.domain_name === primaryDomain && d.is_active && d.status === 'active');
            setBrandedLinkStatus(primaryDomainData ? 'accessible' : 'inaccessible');
            return;
          }
          
          const result = response.data;
          if (result.accessible) {
            setBrandedLinkStatus('accessible');
            // Log successful accessibility check
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
        })
        .catch((error) => {
          console.error('Domain accessibility check failed:', error);
          // If domain is active and verified, assume it's working (optimistic)
          const primaryDomainData = customDomains?.find(d => d.domain_name === primaryDomain && d.is_active && d.status === 'active');
          setBrandedLinkStatus(primaryDomainData ? 'accessible' : 'checking');
        });
    } else {
      setBrandedLinkStatus(null);
    }
  }, [brandedUrl, primaryDomain, primaryLink?.link_token, customDomains, user]);

  if (isLoading || !primaryLink) {
    return null;
  }

  // Generate unbranded URL - always use secure.disclosurely.com (not app.disclosurely.com)
  const unbrandedUrl = `https://secure.disclosurely.com/secure/tool/submit/${primaryLink.link_token}`;

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
          {/* Default Link - Always show first */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">Default Secure Link</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Used {primaryLink.usage_count || 0} times
                </p>
                <code className="text-sm bg-background px-3 py-2 rounded border font-mono break-all block">
                  {unbrandedUrl}
                </code>
              </div>
              <Button
                size="sm"
                onClick={() => copyToClipboard(unbrandedUrl)}
                className="whitespace-nowrap shrink-0"
              >
                {t('copyLink')}
              </Button>
            </div>
          </div>

          {/* Branded Link - Show if available */}
          {brandedUrl && primaryDomain ? (
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">Your Branded Secure Link</p>
                    {brandedLinkStatus === 'accessible' && (
                      <Badge variant="default" className="bg-green-600 text-xs h-5">
                        ✓ Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Custom domain: {primaryDomain}
                  </p>
                  <code className="text-sm bg-background px-3 py-2 rounded border font-mono break-all block">
                    {brandedUrl}
                  </code>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(brandedUrl)}
                  className="whitespace-nowrap shrink-0"
                  disabled={brandedLinkStatus === 'inaccessible'}
                >
                  {t('copyLink')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-xs text-muted-foreground">
                <strong>Want a branded link?</strong> Go to <a href="/dashboard/settings" className="text-blue-600 hover:underline">Settings → Custom Domains</a> to set up your own domain.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </>
  );
};

export default LinkGenerator;
