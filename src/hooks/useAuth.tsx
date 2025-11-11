import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: 'basic' | 'pro';
  subscription_end?: string;
  subscription_status?: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired';
  grace_period_ends_at?: string;
  isInGracePeriod?: boolean;
  isExpired?: boolean;
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
  
  // Initialize subscription data from sessionStorage with TTL (auto-clears on tab close)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(() => {
    try {
      const cached = sessionStorage.getItem('subscription_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check TTL (15 minutes)
        if (parsed.expiry && parsed.expiry > Date.now()) {
          return parsed.data;
        }
        // Expired - clear it
        sessionStorage.removeItem('subscription_data');
      }
      return { subscribed: false };
    } catch {
      return { subscribed: false };
    }
  });

  const refreshSubscription = async (currentSession?: Session | null) => {
    // Use passed session or current session state
    const sessionToUse = currentSession || session;
    const userToUse = currentSession?.user || user;
    
    if (!userToUse || !sessionToUse?.access_token) {
      // Clear cached subscription data when no session
      const defaultData = { subscribed: false };
      setSubscriptionData(defaultData);
      sessionStorage.removeItem('subscription_data');
      return;
    }
    
    // Check cache freshness - refresh if older than 15 minutes (reduced from 1 hour for security)
    const cacheKey = `subscription_check_${userToUse.id}`;
    const lastCheck = sessionStorage.getItem(cacheKey);
    const now = Date.now();
    
    // Always refresh on login to ensure fresh data (remove cache check temporarily for debugging)
    // if (lastCheck && (now - parseInt(lastCheck)) < 900000) { // 15 minutes
    //   return;
    // }

    // First try direct database query for speed (no edge function)
    try {
      const { data: directData, error: directError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end, subscription_status, grace_period_ends_at')
        .eq('user_id', userToUse.id)
        .maybeSingle();

      if (!directError && directData) {
        const now = new Date();
        const subscriptionEnd = directData.subscription_end ? new Date(directData.subscription_end) : null;
        const gracePeriodEnds = directData.grace_period_ends_at ? new Date(directData.grace_period_ends_at) : null;
        
        // Check if subscription is expired based on date
        const isExpiredByDate = subscriptionEnd ? subscriptionEnd < now : false;
        const isInGracePeriod = gracePeriodEnds ? gracePeriodEnds > now : false;
        
        // Use database subscribed value if available, otherwise calculate from status
        let subscribed = directData.subscribed ?? false;
        
        // If subscription_status is 'active' or 'trialing', ensure subscribed is true
        if (directData.subscription_status === 'active' || directData.subscription_status === 'trialing') {
          subscribed = true;
        }
        
        // If subscription_status is 'canceled' or 'expired', ensure subscribed is false (unless in grace period)
        if (directData.subscription_status === 'canceled' || directData.subscription_status === 'expired') {
          subscribed = isInGracePeriod; // Only subscribed if in grace period
        }
        
        // If subscription_end is in the future and status is active, ensure subscribed is true
        if (subscriptionEnd && subscriptionEnd > now && (directData.subscription_status === 'active' || directData.subscription_status === 'trialing')) {
          subscribed = true;
        }
        
        // Determine subscription status
        let subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired' = directData.subscription_status as any || 'active';
        
        // Only mark as expired if date is past AND not in grace period AND status allows it
        if (isExpiredByDate && !isInGracePeriod && subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
          subscriptionStatus = 'expired';
        }
        
        const mappedData: SubscriptionData = {
          subscribed: subscribed || isInGracePeriod,
          subscription_tier: directData.subscription_tier as 'basic' | 'pro',
          subscription_end: directData.subscription_end,
          subscription_status: subscriptionStatus,
          grace_period_ends_at: directData.grace_period_ends_at,
          isInGracePeriod,
          isExpired: isExpiredByDate && !isInGracePeriod && subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing',
        };
        
        setSubscriptionData(mappedData);
        // Store with TTL (15 minutes) for security
        const dataWithTTL = {
          data: mappedData,
          expiry: now.getTime() + (15 * 60 * 1000)
        };
        sessionStorage.setItem('subscription_data', JSON.stringify(dataWithTTL));
        sessionStorage.setItem(cacheKey, now.getTime().toString());
        return;
      }
    } catch (error) {
      // Silent fallback
    }
    
    try {
      setSubscriptionLoading(true);
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionToUse.access_token}`,
        },
      });

      if (error) {
        return;
      }
      
      const nowDate = new Date();
      const subscriptionEnd = data?.subscription_end ? new Date(data.subscription_end) : null;
      const gracePeriodEnds = data?.grace_period_ends_at ? new Date(data.grace_period_ends_at) : null;
      
      const isExpired = subscriptionEnd ? subscriptionEnd < nowDate : false;
      const isInGracePeriod = gracePeriodEnds ? gracePeriodEnds > nowDate : false;
      
      const mappedData: SubscriptionData = {
        subscribed: data?.subscribed || false,
        subscription_tier: data?.subscription_tier || undefined,
        subscription_end: data?.subscription_end || undefined,
        subscription_status: data?.subscription_status || undefined,
        grace_period_ends_at: data?.grace_period_ends_at || undefined,
        isInGracePeriod,
        isExpired: isExpired && !isInGracePeriod,
      };
      
      setSubscriptionData(mappedData);
      
      // Cache the subscription data with TTL (15 minutes) for security
      const dataWithTTL = {
        data: mappedData,
        expiry: now + (15 * 60 * 1000)
      };
      sessionStorage.setItem('subscription_data', JSON.stringify(dataWithTTL));
      sessionStorage.setItem(cacheKey, now.toString());
    } catch (error) {
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
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Only check subscription for token refresh events, not during initial sign in
        // This prevents authentication disruption if subscription service is down
        if (event === 'TOKEN_REFRESHED' && session?.user && session?.access_token) {
          // Delay subscription check to ensure session is fully established
          setTimeout(() => {
            refreshSubscription(session);
          }, 1000);
        } else if (event === 'SIGNED_OUT') {
          // Clear subscription data on actual logout
          setSubscriptionData({ subscribed: false });
        } else if (event === 'SIGNED_IN') {
          // Check subscription after successful sign-in with a delay
          setTimeout(() => {
            refreshSubscription(session);
          }, 1500);
          // Clear session tracking flag on new sign-in to allow re-tracking
          // This will be handled by useMultipleSessionDetection hook
        }
      }
    );

    // Get initial session and check subscription once
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription for existing session after a delay
      if (session?.user && session?.access_token) {
        setTimeout(() => {
          refreshSubscription(session);
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear session tracking from sessionStorage
    if (user) {
      sessionStorage.removeItem(`session_id_${user.id}`);
    }
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
