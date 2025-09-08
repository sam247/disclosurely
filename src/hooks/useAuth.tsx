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
    
    // Skip if we already have subscription data to avoid unnecessary calls
    if (subscriptionData.subscribed && subscriptionData.subscription_tier) {
      console.log('Subscription data already exists, skipping check');
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
        
        // Only check subscription for token refresh and sign in events, not during OTP process
        if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session?.user && session?.access_token) {
          // Delay subscription check to ensure session is fully established
          setTimeout(() => {
            console.log('Checking subscription after auth event:', event);
            refreshSubscription(session);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          // Clear subscription data on actual logout
          setSubscriptionData({ subscribed: false });
          console.log('User signed out, clearing subscription data');
        }
      }
    );

    // Get initial session and check subscription once
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Only check subscription if we have a valid session and no existing subscription data
      if (session?.user && session?.access_token && !subscriptionData.subscribed) {
        console.log('Initial session found, checking subscription...');
        refreshSubscription(session);
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
