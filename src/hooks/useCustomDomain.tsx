
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
          currentHost.includes('lovable.app')) {
        setDomainInfo({
          customDomain: null,
          organizationId: null,
          isCustomDomain: false,
          loading: false
        });
        return;
      }

      // Check if it's a disclosurely.com subdomain
      if (currentHost.endsWith('.disclosurely.com') && currentHost !== 'disclosurely.com') {
        try {
          const { data: domainVerification, error } = await supabase
            .from('domain_verifications')
            .select('domain, organization_id, verified_at')
            .eq('domain', currentHost)
            .eq('verification_type', 'SUBDOMAIN')
            .not('verified_at', 'is', null)
            .single();

          if (!error && domainVerification) {
            setDomainInfo({
              customDomain: currentHost,
              organizationId: domainVerification.organization_id,
              isCustomDomain: true,
              loading: false
            });
            return;
          }
        } catch (error) {
          console.error('Error checking subdomain:', error);
        }
      }

      // Check for full custom domains
      try {
        const { data: domainVerification, error } = await supabase
          .from('domain_verifications')
          .select('domain, organization_id, verified_at')
          .eq('domain', currentHost)
          .eq('verification_type', 'CNAME')
          .not('verified_at', 'is', null)
          .single();

        if (!error && domainVerification) {
          setDomainInfo({
            customDomain: currentHost,
            organizationId: domainVerification.organization_id,
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

    checkCustomDomain();
  }, []);

  return domainInfo;
};
