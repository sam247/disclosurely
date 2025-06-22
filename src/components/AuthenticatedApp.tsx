
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Dashboard from './Dashboard';
import { useToast } from '@/hooks/use-toast';

const AuthenticatedApp = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileSetup, setProfileSetup] = useState<'loading' | 'complete' | 'needs_setup'>('loading');

  useEffect(() => {
    if (user) {
      setupUserProfile();
    }
  }, [user]);

  const setupUserProfile = async () => {
    if (!user) return;

    try {
      console.log('Setting up profile for user:', user.email);

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        // Continue with setup anyway
      }

      if (!profile) {
        console.log('No profile found, creating organization and profile...');
        
        // Create organization first
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
            domain: user.email?.split('@')[0] || 'default',
            description: 'Default organization'
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          toast({
            title: "Setup Error",
            description: "Failed to create organization. Please try again.",
            variant: "destructive",
          });
          setProfileSetup('needs_setup');
          return;
        }

        console.log('Organization created:', org);

        // Create profile
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            organization_id: org.id,
            role: 'org_admin'
          });

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          toast({
            title: "Setup Error", 
            description: "Failed to create profile. Please try again.",
            variant: "destructive",
          });
          setProfileSetup('needs_setup');
          return;
        }

        console.log('Profile created successfully');
        toast({
          title: "Welcome!",
          description: "Your organization has been set up successfully.",
        });
      } else if (!profile.organization_id) {
        console.log('Profile exists but no organization, creating one...');
        
        // Create organization for existing profile
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: `${user.email?.split('@')[0] || 'User'}'s Organization`,
            domain: user.email?.split('@')[0] || 'default',
            description: 'Default organization'
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          setProfileSetup('needs_setup');
          return;
        }

        // Update profile with organization
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ organization_id: org.id })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          setProfileSetup('needs_setup');
          return;
        }

        console.log('Profile updated with organization');
      } else {
        console.log('Profile and organization already exist');
      }

      setProfileSetup('complete');
    } catch (error) {
      console.error('Error in setupUserProfile:', error);
      setProfileSetup('needs_setup');
    }
  };

  if (profileSetup === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (profileSetup === 'needs_setup') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Setup Required</h2>
          <p className="mb-4">There was an issue setting up your profile. Please try refreshing the page.</p>
          <button 
            onClick={() => {
              setProfileSetup('loading');
              setupUserProfile();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default AuthenticatedApp;
