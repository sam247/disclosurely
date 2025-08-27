
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
      console.error('Error fetching organization by link token:', err);
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
      console.log('Looking up report with tracking ID:', trackingId);
      
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
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
        .eq('tracking_id', trackingId)
        .single();

      if (reportError || !reportData) {
        console.error('Report lookup error:', reportError);
        throw new Error('Report not found');
      }

      console.log('Found report, setting organization data:', reportData.organizations);
      
      setOrganizationData({
        id: reportData.organizations.id,
        name: reportData.organizations.name,
        logo_url: reportData.organizations.logo_url,
        custom_logo_url: reportData.organizations.custom_logo_url,
        brand_color: reportData.organizations.brand_color
      });
    } catch (err: any) {
      console.error('Error fetching organization by tracking ID:', err);
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
