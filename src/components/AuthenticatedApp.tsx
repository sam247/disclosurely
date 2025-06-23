
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

      // First check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        setProfileStatus('needs_setup');
        return;
      }

      console.log('Profile data:', profile);

      // If no profile exists, create one and mark as needs setup
      if (!profile) {
        console.log('No profile found, creating basic profile');
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            role: 'org_admin',
            is_active: true
          });

        if (createError) {
          console.error('Error creating profile:', createError);
        }
        
        setProfileStatus('needs_setup');
        return;
      }

      // If profile exists but no organization, needs setup
      if (!profile.organization_id) {
        console.log('Profile exists but no organization, needs setup');
        setProfileStatus('needs_setup');
        return;
      }

      // Check if organization exists
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .maybeSingle();

      if (orgError) {
        console.error('Error checking organization:', orgError);
        setProfileStatus('needs_setup');
        return;
      }

      if (!organization) {
        console.log('Organization not found, needs setup');
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
