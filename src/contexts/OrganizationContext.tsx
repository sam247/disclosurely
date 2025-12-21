
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationData {
  id: string;
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color?: string;
}

interface OrganizationContextType {
  organizationData: OrganizationData | null;
  loading: boolean;
  error: string | null;
  fetchOrganizationByLinkToken: (linkToken: string) => Promise<void>;
  fetchOrganizationByTrackingId: (trackingId: string) => Promise<void>;
  reset: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganizationData = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationData must be used within OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setOrganizationData(null);
    setError(null);
    setLoading(false);
  };

  const fetchOrganizationByLinkToken = async (linkToken: string) => {
    if (!linkToken) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: linkData, error: linkError } = await supabase
        .from('organization_links')
        .select(`
          organization_id,
          organizations!inner(
            id,
            name,
            logo_url,
            custom_logo_url,
            brand_color
          )
        `)
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        throw new Error('Organization not found for this link');
      }

      setOrganizationData({
        id: linkData.organizations.id,
        name: linkData.organizations.name,
        logo_url: linkData.organizations.logo_url,
        custom_logo_url: linkData.organizations.custom_logo_url,
        brand_color: linkData.organizations.brand_color
      });
    } catch (err: any) {
      log.error(LogContext.FRONTEND, 'Error fetching organization by link token', err instanceof Error ? err : new Error(String(err)), { linkToken });
      setError(err.message || 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationByTrackingId = async (trackingId: string) => {
    if (!trackingId) return;
    
    setLoading(true);
    setError(null);

    try {
      
      
      // Retry mechanism for newly created reports
      let retries = 3;
      let orgData = null;
      let orgError = null;
      
      while (retries > 0) {
        try {
          // Use the secure function to get organization data by tracking ID
          const { data, error } = await supabase
            .rpc('get_organization_by_tracking_id', { p_tracking_id: trackingId });

          if (!error && data && data.length > 0) {
            orgData = data;
            orgError = null;
            break;
          } else {
            orgError = error;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          }
        } catch (err) {
          orgError = err;
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
        }
      }

      if (orgError || !orgData || orgData.length === 0) {
        log.error(LogContext.FRONTEND, 'Organization lookup error after retries', orgError instanceof Error ? orgError : new Error(String(orgError)), { trackingId, retries: 3 });
        throw new Error('Organization not found for this report');
      }

      const org = orgData[0];
      
      
      setOrganizationData({
        id: org.organization_id,
        name: org.organization_name,
        logo_url: org.logo_url,
        custom_logo_url: org.custom_logo_url,
        brand_color: org.brand_color
      });
    } catch (err: any) {
      log.error(LogContext.FRONTEND, 'Error fetching organization by tracking ID', err instanceof Error ? err : new Error(String(err)), { trackingId });
      setError(err.message || 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizationData,
        loading,
        error,
        fetchOrganizationByLinkToken,
        fetchOrganizationByTrackingId,
        reset
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
