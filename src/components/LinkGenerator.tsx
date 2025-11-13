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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
  available_languages?: string[] | null;
}

const ALL_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
];

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
  const { data: customDomains = [], refetch: refetchDomains, isLoading: isLoadingDomains } = useQuery<CustomDomainRecord[]>({
    queryKey: ['custom-domains', user?.id],
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 0, // Don't cache - always fetch fresh
    queryFn: async () => {
      if (!user) {
        
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
        
        return (result.domains || []) as CustomDomainRecord[];
      }

      
      return [];
    },
  });

  // Listen for domain verification events to immediately refetch
  useEffect(() => {
    const handleDomainVerified = () => {
      
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
  
  // Check if custom domain is verified (status is 'active' or 'verified')
  // Also check if domain is active (is_active = true) as that's what Settings shows
  const isCustomDomainVerified = primaryDomainRecord 
    ? (primaryDomainRecord.status === 'active' || primaryDomainRecord.status === 'verified') && primaryDomainRecord.is_active
    : false;

  // Debug logging
  useEffect(() => {
    if (customDomains.length > 0) {
      
      
      
      
    }
  }, [customDomains, primaryDomainRecord, isCustomDomainVerified, primaryDomainStatus]);

  // Fetch organization info for subdomain and URL toggle settings
  // Use primaryDomainRecord from customDomains query as source of truth for verification status
  const { data: organizationInfo } = useQuery({
    queryKey: ['organization-info', user?.id, primaryDomainRecord?.status],
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
        .select('id, domain, name, active_url_type, custom_domain, custom_domain_verified')
        .eq('id', profile.organization_id)
        .single();

      // Use primaryDomainRecord from customDomains query as source of truth
      // This is more reliable since it's already fetched and up-to-date
      if (org && primaryDomainRecord) {
        const isVerified = primaryDomainRecord.status === 'active' || primaryDomainRecord.status === 'verified';
        // Return org with synced data from custom_domains table
        return {
          ...org,
          custom_domain: primaryDomainRecord.domain_name,
          custom_domain_verified: isVerified
        };
      }

      return org;
    },
    enabled: !!user,
  });

  const [activeUrlType, setActiveUrlType] = useState<'subdomain' | 'custom_domain'>('subdomain');
  const [isSavingUrlType, setIsSavingUrlType] = useState(false);

  // Sync activeUrlType with organization data
  useEffect(() => {
    if (organizationInfo?.active_url_type) {
      setActiveUrlType(organizationInfo.active_url_type as 'subdomain' | 'custom_domain');
    }
  }, [organizationInfo?.active_url_type]);

  // Fetch the primary active link
  const { data: primaryLink, isLoading, refetch: refetchPrimaryLink } = useQuery({
    queryKey: ['primary-link', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return null;

      // First, try to get active links
      let { data: links } = await supabase
        .from('organization_links')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      // If no active link, get any link (including inactive)
      if (!links || links.length === 0) {
        const { data: allLinks } = await supabase
          .from('organization_links')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })
          .limit(1);
        links = allLinks;
      }

      // If still no link exists, create a default one
      if (!links || links.length === 0) {
        // Create default link
        const { data: org } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', profile.organization_id)
          .single();

        const { data: newLink, error: createError } = await supabase
          .from('organization_links')
          .insert({
            organization_id: profile.organization_id,
            name: org?.name || 'Default Submission Link',
            description: 'Default secure submission link',
            is_active: true,
            default_language: 'en',
            available_languages: ['en'],
            created_by: user.id
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating default link:', createError);
          return null;
        }

        links = [newLink];
      }

      const link = links?.[0];
      if (link && link.available_languages) {
        // Parse JSONB array if it's a string
        if (typeof link.available_languages === 'string') {
          link.available_languages = JSON.parse(link.available_languages);
        }
      }
      
      return link || null;
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

  // Update available languages
  const updateAvailableLanguagesMutation = useMutation({
    mutationFn: async ({ id, available_languages }: { id: string, available_languages: string[] }) => {
      const { error } = await supabase
        .from('organization_links')
        .update({ available_languages })
        .eq('id', id)
        .select();

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch to get fresh data
      queryClient.invalidateQueries({ queryKey: ['primary-link'] });
      queryClient.refetchQueries({ queryKey: ['primary-link'] });
      toast({
        title: "Languages Updated",
        description: "Available languages for the form have been updated successfully.",
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

  // Update active URL type
  const updateUrlTypeMutation = useMutation({
    mutationFn: async ({ organizationId, active_url_type }: { organizationId: string, active_url_type: 'subdomain' | 'custom_domain' }) => {
      // Validate: can't switch to custom_domain if it's not verified
      if (active_url_type === 'custom_domain' && !organizationInfo?.custom_domain_verified) {
        throw new Error('Custom domain must be verified before it can be set as active.');
      }

      const { error } = await supabase
        .from('organizations')
        .update({ active_url_type })
        .eq('id', organizationId);

      if (error) throw error;
    },
    onSuccess: async () => {
      // Invalidate and refetch organization info
      queryClient.invalidateQueries({ queryKey: ['organization-info', user?.id] });
      queryClient.refetchQueries({ queryKey: ['organization-info', user?.id] });
      
      // Log the change
      if (user?.id && organizationInfo?.id) {
        auditLogger.log({
          eventType: 'organization.url_type_changed',
          category: 'system',
          action: 'update_url_type',
          actorType: 'user',
          actorId: user.id,
          organizationId: organizationInfo.id,
          summary: `Active URL type changed to: ${activeUrlType}`,
          metadata: { 
            previousType: organizationInfo.active_url_type,
            newType: activeUrlType,
            customDomain: organizationInfo.custom_domain
          }
        }).catch(console.error);
      }

      toast({
        title: "URL Type Updated",
        description: "The active URL type has been updated. The old URL will automatically redirect to the new one.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update URL type",
        variant: "destructive",
      });
    },
  });

  const handleSaveUrlType = async () => {
    if (!organizationInfo?.id) return;
    
    if (activeUrlType === 'custom_domain' && !isCustomDomainVerified) {
      toast({
        title: "Cannot Switch",
        description: "Custom domain must be verified before it can be set as active.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingUrlType(true);
    try {
      await updateUrlTypeMutation.mutateAsync({
        organizationId: organizationInfo.id,
        active_url_type: activeUrlType
      });
    } finally {
      setIsSavingUrlType(false);
    }
  };

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
    // LinkGenerator initialized
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!primaryLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Secure Report Link</CardTitle>
          <CardDescription>
            No active link found. Please contact support to set up your secure submission portal.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Generate subdomain URL from organization domain slug
  // If domain is missing, generate it from organization name
  const getDomainSlug = () => {
    if (organizationInfo?.domain) {
      return organizationInfo.domain;
    }
    // Fallback: generate from organization name if domain is missing
    if (organizationInfo?.name) {
      return organizationInfo.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '')  // Remove special characters
        .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
    }
    return null;
  };

  const domainSlug = getDomainSlug();
  const subdomainUrl = domainSlug
    ? `https://${domainSlug}.disclosurely.com/report`
    : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg">{t('secureReportLink')}</CardTitle>
            <CardDescription className="text-sm mt-1">
              Choose which URL type should be active. Only one can be active at a time. The inactive URL will automatically redirect to the active one.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={activeUrlType}
            onValueChange={(value) => setActiveUrlType(value as 'subdomain' | 'custom_domain')}
            className="space-y-3"
          >
                  {/* Subdomain Option */}
                  <div className="flex items-start space-x-3 p-3 border rounded-lg bg-background">
                    <RadioGroupItem 
                      value="subdomain" 
                      id="subdomain" 
                      className="mt-1" 
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="subdomain" className="text-sm font-semibold cursor-pointer">
                        Standard Subdomain
                      </Label>
                      {subdomainUrl && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 min-w-0 break-all">
                              {subdomainUrl}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(subdomainUrl)}
                              className="shrink-0"
                            >
                              {t('copyLink')}
                            </Button>
                          </div>
                          {activeUrlType === 'subdomain' && activeUrlType === organizationInfo?.active_url_type && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Currently active</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Domain Option */}
                  <div className="flex items-start space-x-3 p-3 border rounded-lg bg-background">
                    <RadioGroupItem 
                      value="custom_domain" 
                      id="custom_domain" 
                      className="mt-1"
                      disabled={!brandedUrl || !isCustomDomainVerified}
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor="custom_domain" 
                        className={`text-sm font-semibold ${(!brandedUrl || !isCustomDomainVerified) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        Custom Domain
                      </Label>
                      {!brandedUrl ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          <span>Not configured - Set up custom domain in Settings → Custom Domains</span>
                        </div>
                      ) : !isCustomDomainVerified ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Pending verification - Domain must be verified before it can be activated</span>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 min-w-0 break-all">
                              {brandedUrl}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(brandedUrl)}
                              className="shrink-0"
                              disabled={brandedLinkStatus === 'inaccessible'}
                            >
                              {t('copyLink')}
                            </Button>
                          </div>
                          {activeUrlType === 'custom_domain' && activeUrlType === organizationInfo?.active_url_type && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Currently active</span>
                            </div>
                          )}
                          {brandedLinkStatus === 'checking' && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Checking accessibility...</span>
                            </div>
                          )}
                          {brandedLinkStatus === 'inaccessible' && (
                            <div className="flex items-center gap-2 text-xs text-amber-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>Needs attention - Domain may not be properly configured</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>

          {/* Save Button */}
          {activeUrlType !== organizationInfo?.active_url_type && (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveUrlType}
                loading={isSavingUrlType}
                loadingText="Saving..."
                size="sm"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}


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
            Configure which languages appear in your submission form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                {ALL_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This sets the default language when users access your submission form. Users can still change the language within the form.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Available Languages</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select which languages should appear in the form. Only selected languages will be available to users.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/50">
              {ALL_LANGUAGES.map((lang) => {
                const availableLanguages = primaryLink.available_languages || ALL_LANGUAGES.map(l => l.code);
                const isChecked = availableLanguages.includes(lang.code);
                
                return (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang.code}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const current = primaryLink.available_languages || ALL_LANGUAGES.map(l => l.code);
                        const updated = checked
                          ? [...current, lang.code]
                          : current.filter((code: string) => code !== lang.code);
                        
                        // Ensure at least one language is selected
                        if (updated.length === 0) {
                          toast({
                            title: "Error",
                            description: "At least one language must be selected.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Ensure default language is always included
                        const defaultLang = primaryLink.default_language || 'en';
                        if (!updated.includes(defaultLang)) {
                          updated.push(defaultLang);
                        }

                        updateAvailableLanguagesMutation.mutate({
                          id: primaryLink.id,
                          available_languages: updated
                        });
                      }}
                    />
                    <Label
                      htmlFor={`lang-${lang.code}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const availableLanguages = primaryLink.available_languages || ALL_LANGUAGES.map(l => l.code);
                return `${availableLanguages.length} of ${ALL_LANGUAGES.length} languages selected`;
              })()}
            </p>
          </div>
        </CardContent>
      </Card>

    </>
  );
};

export default LinkGenerator;
