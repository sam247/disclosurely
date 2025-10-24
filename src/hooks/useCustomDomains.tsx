import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CustomDomain } from '@/types/database';

export interface DomainVerificationResult {
  verified: boolean;
  message: string;
  domain?: CustomDomain;
}

export interface DNSInstructions {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export interface AddDomainResult {
  domain: CustomDomain;
  dns_instructions: DNSInstructions;
}

export const useCustomDomains = () => {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();


  const fetchDomains = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('custom-domains', {
        body: {
          action: 'list'
        }
      });

      if (error) {
        throw error;
      }

      setDomains(data.domains || []);
    } catch (err) {
      console.error('Error fetching domains:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async (domainName: string): Promise<AddDomainResult> => {
    try {
      console.log('🔍 Starting addDomain with:', domainName);
      console.log('🔍 Current session:', session?.user?.id);
      
      const { data, error } = await supabase.functions.invoke('custom-domains', {
        body: {
          action: 'add',
          domain_name: domainName
        }
      });

      console.log('🔍 API Response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Domain added successfully, refreshing list...');
      // Refresh domains list
      await fetchDomains();
      
      return data;
    } catch (err) {
      console.error('❌ Error adding domain:', err);
      throw err;
    }
  };

  const verifyDomain = async (domainId: string): Promise<DomainVerificationResult> => {
    try {
      console.log('🔍 Starting verifyDomain with:', domainId);
      
      const { data, error } = await supabase.functions.invoke('custom-domains', {
        body: {
          action: 'verify',
          domainId: domainId
        }
      });

      console.log('🔍 Verify API Response:', { data, error });

      if (error) {
        console.error('❌ Supabase verify error:', error);
        throw error;
      }

      console.log('✅ Domain verified successfully, refreshing list...');
      // Refresh domains list to get updated status
      await fetchDomains();
      
      return data;
    } catch (err) {
      console.error('❌ Error verifying domain:', err);
      throw err;
    }
  };

  const activateDomain = async (domainId: string): Promise<CustomDomain> => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-domains', {
        body: {
          action: 'update',
          domainId: domainId,
          updates: { 
            is_active: true,
            status: 'active',
            activated_at: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw error;
      }

      // Refresh domains list
      await fetchDomains();
      
      return data.domain;
    } catch (err) {
      console.error('Error activating domain:', err);
      throw err;
    }
  };

  const deleteDomain = async (domainId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('custom-domains', {
        body: {
          action: 'delete',
          domainId: domainId
        }
      });

      if (error) {
        throw error;
      }

      // Refresh domains list
      await fetchDomains();
    } catch (err) {
      console.error('Error deleting domain:', err);
      throw err;
    }
  };

  const setPrimaryDomain = async (domainId: string): Promise<CustomDomain> => {
    try {
      // First, unset any existing primary domain
      const primaryDomain = domains.find(d => d.is_primary);
      if (primaryDomain) {
        await supabase.functions.invoke('custom-domains', {
          body: {
            action: 'update',
            domainId: primaryDomain.id,
            updates: { is_primary: false }
          }
        });
      }

      // Set new primary domain
      const { data, error } = await supabase.functions.invoke('custom-domains', {
        body: {
          action: 'update',
          domainId: domainId,
          updates: { is_primary: true }
        }
      });

      if (error) {
        throw error;
      }

      // Refresh domains list
      await fetchDomains();
      
      return data.domain;
    } catch (err) {
      console.error('Error setting primary domain:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return {
    domains,
    loading,
    error,
    fetchDomains,
    addDomain,
    verifyDomain,
    activateDomain,
    deleteDomain,
    setPrimaryDomain,
  };
};
