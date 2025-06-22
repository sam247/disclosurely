
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  organization_id: string | null;
  role: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
}

export const useOrganization = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false
  const [needsOnboarding, setNeedsOnboarding] = useState(false); // Always false
  const { user } = useAuth();

  useEffect(() => {
    // Simplified: don't fetch anything, just set loading to false
    setLoading(false);
  }, [user]);

  const hasOrganization = () => {
    return true; // Always return true to bypass checks
  };

  const fetchUserProfile = async () => {
    // Empty function to maintain compatibility
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
