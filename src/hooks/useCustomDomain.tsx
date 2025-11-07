
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
        console.log('🔍 useCustomDomain: Skipping - localhost or lovable.app domain');
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
        console.log('🔍 useCustomDomain: Querying custom_domains table...');
        
        const { data: customDomain, error } = await supabase
          .from('custom_domains')
          .select('domain_name, organization_id, is_active, status')
          .eq('domain_name', currentHost)
          .eq('is_active', true)
          .eq('status', 'active')
          .maybeSingle(); // Use maybeSingle() to avoid errors when no domain found

        if (error) {
          console.error('🔍 useCustomDomain: Database error:', error);
          setDomainInfo({
            customDomain: null,
            organizationId: null,
            isCustomDomain: false,
            loading: false
          });
          return;
        }

        if (customDomain) {
          console.log('🔍 useCustomDomain: Found custom domain:', {
            domain: customDomain.domain_name,
            orgId: customDomain.organization_id,
            isActive: customDomain.is_active,
            status: customDomain.status
          });
          
          setDomainInfo({
            customDomain: currentHost,
            organizationId: customDomain.organization_id,
            isCustomDomain: true,
            loading: false
          });
          return;
        }

        console.log('🔍 useCustomDomain: No custom domain found for:', currentHost);
      } catch (error) {
        console.error('🔍 useCustomDomain: Unexpected error:', error);
      }

      // Default case
      console.log('🔍 useCustomDomain: Using default (non-custom domain)');
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
