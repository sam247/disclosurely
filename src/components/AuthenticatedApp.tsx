
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Dashboard from './Dashboard';
import SimpleOrganizationSetup from './SimpleOrganizationSetup';
import { useToast } from '@/hooks/use-toast';

const AuthenticatedApp = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileStatus, setProfileStatus] = useState<'loading' | 'needs_setup' | 'complete'>('loading');

  useEffect(() => {
    if (user) {
      checkUserProfile();
    }
  }, [user]);

  const checkUserProfile = async () => {
    if (!user) return;

    try {
      console.log('Checking profile for user:', user.email);

      // Check if profile exists with organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        setProfileStatus('needs_setup');
        return;
      }

      if (!profile) {
        console.log('No profile found, needs setup');
        setProfileStatus('needs_setup');
        return;
      }

      if (!profile.organization_id) {
        console.log('Profile exists but no organization, needs setup');
        setProfileStatus('needs_setup');
        return;
      }

      console.log('Profile and organization found, setup complete');
      setProfileStatus('complete');
    } catch (error) {
      console.error('Error in checkUserProfile:', error);
      setProfileStatus('needs_setup');
    }
  };

  const handleSetupComplete = () => {
    console.log('Setup completed, refreshing profile check');
    setProfileStatus('loading');
    checkUserProfile();
  };

  if (profileStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (profileStatus === 'needs_setup') {
    return <SimpleOrganizationSetup onComplete={handleSetupComplete} />;
  }

  return <Dashboard />;
};

export default AuthenticatedApp;
