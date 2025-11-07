
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomDomainInfo {
  customDomain: string | null;
  organizationId: string | null;
  isCustomDomain: boolean;
  loading: boolean;
  refreshDomainInfo?: () => void;
}

export const useCustomDomain = (): CustomDomainInfo => {
  const [domainInfo, setDomainInfo] = useState<CustomDomainInfo>({
    customDomain: null,
    organizationId: null,
    isCustomDomain: false,
    loading: true
  });

  const checkCustomDomain = async () => {
      const currentHost = window.location.hostname;
      console.log('🔍 useCustomDomain: Checking domain:', currentHost);

      // Skip if on localhost or default Lovable domains
      if (currentHost === 'localhost' ||
          currentHost.includes('lovable.app')) {
        console.log('⏭️ useCustomDomain: Skipping localhost/lovable domain');
        setDomainInfo({
          customDomain: null,
          organizationId: null,
          isCustomDomain: false,
          loading: false
        });
        return;
      }

      // Check for disclosurely.com subdomain pattern: {slug}.disclosurely.com
      const subdomainMatch = currentHost.match(/^([^.]+)\.disclosurely\.com$/);
      if (subdomainMatch) {
        const slug = subdomainMatch[1];

        // Skip if it's the main app domain or secure domain
        if (slug === 'app' || slug === 'www' || slug === 'secure') {
          console.log('⏭️ useCustomDomain: Skipping app/www/secure subdomain');
          setDomainInfo({
            customDomain: null,
            organizationId: null,
            isCustomDomain: false,
            loading: false
          });
          return;
        }

        console.log('📡 useCustomDomain: Detected subdomain slug:', slug);

        try {
          // Look up organization by domain slug
          const { data: org, error } = await supabase
            .from('organizations')
            .select('id, domain, name')
            .eq('domain', slug)
            .eq('is_active', true)
            .single();

          console.log('📡 useCustomDomain: Subdomain query result:', { data: org, error });

          if (!error && org) {
            console.log('✅ useCustomDomain: Organization found via subdomain!', org);
            setDomainInfo({
              customDomain: currentHost,
              organizationId: org.id,
              isCustomDomain: true,
              loading: false
            });
            return;
          } else {
            console.log('❌ useCustomDomain: No organization found for subdomain:', slug);
          }
        } catch (error) {
          console.error('❌ useCustomDomain: Error checking subdomain:', error);
        }
      }

      // Check for custom domains (e.g., testing.betterranking.co.uk)
      try {
        console.log('📡 useCustomDomain: Querying custom_domains table for:', currentHost);
        const { data: customDomain, error } = await supabase
          .from('custom_domains')
          .select('domain_name, organization_id, is_active, status')
          .eq('domain_name', currentHost)
          .eq('is_active', true)
          .eq('status', 'active')
          .single();

        console.log('📡 useCustomDomain: Query result:', { data: customDomain, error });

        if (!error && customDomain) {
          console.log('✅ useCustomDomain: Custom domain found!', customDomain);
          setDomainInfo({
            customDomain: currentHost,
            organizationId: customDomain.organization_id,
            isCustomDomain: true,
            loading: false
          });
          return;
        } else {
          console.log('❌ useCustomDomain: No custom domain found or error occurred');
        }
      } catch (error) {
        console.error('❌ useCustomDomain: Error checking custom domain:', error);
      }

      // Default case
      console.log('⚠️ useCustomDomain: Defaulting to no custom domain');
      setDomainInfo({
        customDomain: null,
        organizationId: null,
        isCustomDomain: false,
        loading: false
      });
  };

  useEffect(() => {
    checkCustomDomain();
  }, []);

  // Add a refresh function to allow manual refresh
  const refreshDomainInfo = () => {
    checkCustomDomain();
  };

  return { ...domainInfo, refreshDomainInfo };
};
