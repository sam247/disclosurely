
import { useState, useEffect, useMemo } from 'react';
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

  // Memoize the hostname to avoid unnecessary re-runs
  const currentHost = useMemo(() => window.location.hostname, []);

  const checkCustomDomain = async () => {
      

      // Skip if on localhost or default Lovable domains
      if (currentHost === 'localhost' ||
          currentHost.includes('lovable.app')) {
        
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
          
          setDomainInfo({
            customDomain: null,
            organizationId: null,
            isCustomDomain: false,
            loading: false
          });
          return;
        }

        

        try {
          // Look up organization by domain slug
          const { data: org, error } = await supabase
            .from('organizations')
            .select('id, domain, name')
            .eq('domain', slug)
            .eq('is_active', true)
            .single();

          

          if (!error && org) {
            
            setDomainInfo({
              customDomain: null, // Subdomain, not custom domain
              organizationId: org.id,
              isCustomDomain: false, // This is a subdomain, not a custom domain
              loading: false
            });
            return;
          } else {
            
          }
        } catch (error) {
          // Error handled silently - domain check failures are expected
        }
      }

      // Check for custom domains (e.g., testing.betterranking.co.uk)
      try {
        

        const { data: customDomain, error } = await supabase
          .from('custom_domains')
          .select('domain_name, organization_id, is_active, status')
          .eq('domain_name', currentHost)
          .eq('is_active', true)
          .eq('status', 'active')
          .maybeSingle(); // Use maybeSingle() to avoid errors when no domain found

        

        if (error) {
          setDomainInfo({
            customDomain: null,
            organizationId: null,
            isCustomDomain: false,
            loading: false
          });
          return;
        }

        if (customDomain) {
          
          setDomainInfo({
            customDomain: currentHost,
            organizationId: customDomain.organization_id,
            isCustomDomain: true,
            loading: false
          });
          return;
        } else {
          
        }
      } catch (error) {
        // Error handled silently - domain check failures are expected
      }

      // Default case
      
      setDomainInfo({
        customDomain: null,
        organizationId: null,
        isCustomDomain: false,
        loading: false
      });
  };

  useEffect(() => {
    checkCustomDomain();
    // Only re-run if hostname actually changes (e.g., navigation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHost]);

  // Add a refresh function to allow manual refresh
  const refreshDomainInfo = () => {
    checkCustomDomain();
  };

  return { ...domainInfo, refreshDomainInfo };
};
