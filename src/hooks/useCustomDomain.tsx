
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomDomainInfo {
  customDomain: string | null;
  organizationId: string | null;
  isCustomDomain: boolean;
  loading: boolean;
}

export const useCustomDomain = (): CustomDomainInfo => {
  const [domainInfo, setDomainInfo] = useState<CustomDomainInfo>({
    customDomain: null,
    organizationId: null,
    isCustomDomain: false,
    loading: true
  });

  useEffect(() => {
    const checkCustomDomain = async () => {
      const currentHost = window.location.hostname;
      
      // Skip if on localhost or default Lovable domains
      if (currentHost === 'localhost' || 
          currentHost.includes('lovable.app') || 
          currentHost.includes('disclosurely.com')) {
        setDomainInfo({
          customDomain: null,
          organizationId: null,
          isCustomDomain: false,
          loading: false
        });
        return;
      }

      try {
        // Check if current domain is a verified custom domain
        const { data: domainVerification, error } = await supabase
          .from('domain_verifications')
          .select('domain, organization_id, verified_at')
          .eq('domain', currentHost)
          .not('verified_at', 'is', null)
          .single();

        if (error || !domainVerification) {
          setDomainInfo({
            customDomain: null,
            organizationId: null,
            isCustomDomain: false,
            loading: false
          });
          return;
        }

        setDomainInfo({
          customDomain: currentHost,
          organizationId: domainVerification.organization_id,
          isCustomDomain: true,
          loading: false
        });
      } catch (error) {
        console.error('Error checking custom domain:', error);
        setDomainInfo({
          customDomain: null,
          organizationId: null,
          isCustomDomain: false,
          loading: false
        });
      }
    };

    checkCustomDomain();
  }, []);

  return domainInfo;
};
