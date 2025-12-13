
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  brand_color: string | null;
  logo_url: string | null;
  custom_logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  organization_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
}

export const useOrganization = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      

      // Get user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setNeedsOnboarding(true);
        return;
      }

      
      setProfile(profileData);

      // If profile has organization, fetch organization details
      if (profileData.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
        } else {
          
          setOrganization(orgData);
        }
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  const hasOrganization = () => {
    return organization !== null && profile?.organization_id !== null;
  };

  return {
    organization,
    profile,
    loading,
    needsOnboarding,
    hasOrganization,
    refetch: fetchUserProfile
  };
};
