import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: 'basic' | 'pro';
  subscription_end?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionLoading: boolean;
  subscriptionData: SubscriptionData;
  signOut: () => Promise<void>;
  refreshSubscription: (currentSession?: Session | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });

  const refreshSubscription = async (currentSession?: Session | null) => {
    // Use passed session or current session state
    const sessionToUse = currentSession || session;
    const userToUse = currentSession?.user || user;
    
    if (!userToUse || !sessionToUse?.access_token) {
      console.log('Skipping subscription check - no user or session', {
        hasUser: !!userToUse,
        hasSession: !!sessionToUse,
        hasAccessToken: !!sessionToUse?.access_token
      });
      // Set default subscription state when no session
      setSubscriptionData({ subscribed: false });
      return;
    }
    
    // Skip if we already have valid subscription data to avoid unnecessary calls
    if (subscriptionData.subscribed && subscriptionData.subscription_tier && 
        subscriptionData.subscription_end) {
      console.log('Complete subscription data already exists, skipping check');
      return;
    }
    
    try {
      console.log('Subscription check attempt for user:', userToUse.email);
      setSubscriptionLoading(true);
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionToUse.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        // Set basic data on error - user exists but subscription check failed
        setSubscriptionData({ subscribed: false });
        return;
      }

      console.log('Subscription data received from API:', data);
      
      const mappedData = {
        subscribed: data?.subscribed || false,
        subscription_tier: data?.subscription_tier || undefined,
        subscription_end: data?.subscription_end || undefined,
      };
      
      console.log('Mapped subscription data:', mappedData);
      setSubscriptionData(mappedData);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      // Set basic data on error - user exists but subscription check failed
      setSubscriptionData({ subscribed: false });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Only check subscription for token refresh events, not during initial sign in
        // This prevents authentication disruption if subscription service is down
        if (event === 'TOKEN_REFRESHED' && session?.user && session?.access_token) {
          // Delay subscription check to ensure session is fully established
          setTimeout(() => {
            console.log('Checking subscription after token refresh:', event);
            refreshSubscription(session);
          }, 1000);
        } else if (event === 'SIGNED_OUT') {
          // Clear subscription data on actual logout
          setSubscriptionData({ subscribed: false });
          console.log('User signed out, clearing subscription data');
        } else if (event === 'SIGNED_IN') {
          // Check subscription after successful sign-in with a delay
          setTimeout(() => {
            console.log('User signed in, checking subscription after delay');
            refreshSubscription(session);
          }, 1500);
        }
      }
    );

    // Get initial session and check subscription once
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription for existing session after a delay
      if (session?.user && session?.access_token) {
        setTimeout(() => {
          console.log('Checking subscription for existing session');
          refreshSubscription(session);
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscriptionData({ subscribed: false });
    // Redirect to main domain instead of app subdomain
    window.location.href = 'https://disclosurely.com';
  };

  const value = {
    user,
    session,
    loading,
    subscriptionLoading,
    subscriptionData,
    signOut,
    refreshSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
