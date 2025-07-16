
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: 'basic' | 'pro';
  subscription_end?: string;
  employee_count?: string;
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
      console.log('Refreshing subscription data...');
      
      // Add timeout using Promise.race to prevent hanging requests
      const subscriptionPromise = supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Subscription check timeout')), 5000)
      );

      const { data, error } = await Promise.race([subscriptionPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Subscription check error:', error);
        // Set default subscription data on error to prevent blocking UI
        setSubscriptionData({ subscribed: false });
        return;
      }

      console.log('Subscription data received from API:', data);
      
      // Ensure we properly map the subscription data
      const mappedData = {
        subscribed: data?.subscribed || false,
        subscription_tier: data?.subscription_tier || undefined,
        subscription_end: data?.subscription_end || undefined,
        employee_count: data?.employee_count || undefined,
      };
      
      console.log('Mapped subscription data:', mappedData);
      setSubscriptionData(mappedData);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      // Set default subscription data on error to prevent blocking UI
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
        
        // Immediately check subscription on login - use setTimeout to avoid blocking auth flow
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => refreshSubscription(), 0);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Immediately check subscription on initial load if user exists
      if (session?.user) {
        setTimeout(() => refreshSubscription(), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-refresh subscription every 5 minutes when user is logged in (reduced frequency)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      refreshSubscription();
    }, 300000); // 5 minutes instead of 30 seconds
    
    return () => clearInterval(interval);
  }, [user, session]);

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
