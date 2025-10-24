
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

      // Check for custom domains (no more subdomain support)
      try {
        const { data: customDomain, error } = await supabase
          .from('custom_domains')
          .select('domain_name, organization_id, is_active, status')
          .eq('domain_name', currentHost)
          .eq('is_active', true)
          .eq('status', 'active')
          .single();

        if (!error && customDomain) {
          setDomainInfo({
            customDomain: currentHost,
            organizationId: customDomain.organization_id,
            isCustomDomain: true,
            loading: false
          });
          return;
        }
      } catch (error) {
        console.error('Error checking custom domain:', error);
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
  }, []);

  // Add a refresh function to allow manual refresh
  const refreshDomainInfo = () => {
    checkCustomDomain();
  };

  return { ...domainInfo, refreshDomainInfo };
};
