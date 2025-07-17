
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
  subscriptionData: SubscriptionData;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
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
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });

  const refreshSubscription = async () => {
    if (!user || !session?.access_token) return;
    
    try {
      console.log('Subscription check attempt', new Date().toISOString());
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
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
      setSubscriptionData({ subscribed: false });
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
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription when user/session changes
  useEffect(() => {
    if (user && session?.access_token) {
      console.log('User authenticated, checking subscription...');
      refreshSubscription();
    } else if (!user) {
      // Clear subscription data when user logs out
      setSubscriptionData({ subscribed: false });
    }
  }, [user?.id, session?.access_token]); // Only depend on user ID and access token

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
