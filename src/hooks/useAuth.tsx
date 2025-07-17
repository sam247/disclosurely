
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
    if (!user || !session?.access_token) {
      console.log('No user or session, skipping subscription check');
      setSubscriptionData({ subscribed: false });
      return;
    }
    
    try {
      console.log('Subscription check attempt', new Date().toISOString(), 'for user:', user.email);
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        // Don't reset to false immediately on error - could be temporary
        return;
      }

      console.log('Raw subscription data received:', data);
      
      if (data) {
        const mappedData = {
          subscribed: Boolean(data.subscribed),
          subscription_tier: data.subscription_tier || undefined,
          subscription_end: data.subscription_end || undefined,
        };
        
        console.log('Setting subscription data:', mappedData);
        setSubscriptionData(mappedData);
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      // Don't reset subscription data on network errors
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle subscription check based on event
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, will check subscription...');
          // Small delay to ensure session is fully established
          setTimeout(() => {
            refreshSubscription();
          }, 1000);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing subscription data');
          setSubscriptionData({ subscribed: false });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email || 'no user');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If there's an initial session, check subscription
      if (session?.user) {
        console.log('Initial session found, checking subscription...');
        setTimeout(() => {
          refreshSubscription();
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('Signing out...');
    setSubscriptionData({ subscribed: false });
    await supabase.auth.signOut();
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
