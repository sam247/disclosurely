
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { supabase } from '@/integrations/supabase/client';
import Dashboard from './Dashboard';
import SimpleOrganizationSetup from './SimpleOrganizationSetup';
import { useToast } from '@/hooks/use-toast';
import { log, LogContext } from '@/utils/logger';

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
      

      // First check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        log.error(LogContext.AUTH, 'Error checking profile in AuthenticatedApp', profileError instanceof Error ? profileError : new Error(String(profileError)), { userId: user.id });
        toast({
          title: "Error checking profile",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
        setProfileStatus('needs_setup');
        return;
      }

      

      // If no profile exists, create one (shouldn't happen with new signup flow, but handle legacy users)
      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            role: 'org_admin',
            is_active: true
          });

        if (createError) {
          log.error(LogContext.AUTH, 'Error creating profile in AuthenticatedApp', createError instanceof Error ? createError : new Error(String(createError)), { userId: user.id });
          toast({
            title: "Error creating profile",
            description: createError.message,
            variant: "destructive",
          });
        }
        
        // Legacy user without organization - redirect to setup
        setProfileStatus('needs_setup');
        return;
      }

      // If profile exists but no organization, needs setup (legacy users only)
      // New signups create organization during signup, so this should be rare
      if (!profile.organization_id) {
        setProfileStatus('needs_setup');
        return;
      }

      // Check if organization actually exists
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .maybeSingle();

      if (orgError) {
        log.error(LogContext.AUTH, 'Error checking organization in AuthenticatedApp', orgError instanceof Error ? orgError : new Error(String(orgError)), { userId: user.id });
        setProfileStatus('needs_setup');
        return;
      }

      if (!organization) {
        
        // Clear the invalid organization_id from profile
        await supabase
          .from('profiles')
          .update({ organization_id: null })
          .eq('id', user.id);
        
        setProfileStatus('needs_setup');
        return;
      }

      
      setProfileStatus('complete');
    } catch (error) {
      log.error(LogContext.AUTH, 'Error in checkUserProfile', error instanceof Error ? error : new Error(String(error)), { userId: user?.id });
      setProfileStatus('needs_setup');
    }
  };

  const handleSetupComplete = () => {
    
    setProfileStatus('loading');
    checkUserProfile();
  };

  if (profileStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  if (profileStatus === 'needs_setup') {
    
    return (
      <>
        <SimpleOrganizationSetup onComplete={handleSetupComplete} />
      </>
    );
  }

  
  return (
    <>
      <Dashboard />
    </>
  );
};

export default AuthenticatedApp;
