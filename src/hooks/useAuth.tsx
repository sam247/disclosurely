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
  refreshSubscription: (currentSession?: Session | null, forceRefresh?: boolean) => Promise<void>;
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
        // Check TTL (5 minutes)
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

  const refreshSubscription = async (currentSession?: Session | null, forceRefresh: boolean = false) => {
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

    // Check cache freshness - refresh if older than 5 minutes (optimized for performance)
    const cacheKey = `subscription_check_${userToUse.id}`;
    const lastCheck = sessionStorage.getItem(cacheKey);
    const now = Date.now();

    // Return early if cache is still fresh (5 minutes) unless force refresh is requested
    if (!forceRefresh && lastCheck && (now - parseInt(lastCheck)) < 300000) { // 5 minutes in milliseconds
      return;
    }

    // If force refresh, clear cache
    if (forceRefresh) {
      sessionStorage.removeItem('subscription_data');
      sessionStorage.removeItem(cacheKey);
    }

    // First try direct database query for speed (no edge function)
    // Use two separate queries for reliability
    try {
      setSubscriptionLoading(true);

      // Query 1: Get user's organization_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userToUse.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profile?.organization_id) {
        // No organization found, using edge function
        throw new Error('No organization');
      }

      // Organization found

      // Query 2: Get subscription by organization_id
      const { data: subData, error: subError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end, subscription_status, grace_period_ends_at')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();

      if (subError) {
        throw subError;
      }

      if (!subData) {
        // No subscriber record found, using edge function to fetch from Stripe
        throw new Error('No subscriber record');
      }

      // Subscriber data found

      // Process subscription data
      const now = new Date();
      const subscriptionEnd = subData.subscription_end ? new Date(subData.subscription_end) : null;
      const gracePeriodEnds = subData.grace_period_ends_at ? new Date(subData.grace_period_ends_at) : null;
        
      // Check if subscription is expired based on date
      const isExpiredByDate = subscriptionEnd ? subscriptionEnd < now : false;
      const isInGracePeriod = gracePeriodEnds ? gracePeriodEnds > now : false;

      // Use database subscribed value if available, otherwise calculate from status
      let subscribed = subData.subscribed ?? false;

      // If subscription_status is 'active' or 'trialing', ensure subscribed is true
      if (subData.subscription_status === 'active' || subData.subscription_status === 'trialing') {
        subscribed = true;
      }

      // If subscription_status is 'canceled' or 'expired', ensure subscribed is false (unless in grace period)
      if (subData.subscription_status === 'canceled' || subData.subscription_status === 'expired') {
        subscribed = isInGracePeriod; // Only subscribed if in grace period
      }

      // If subscription_end is in the future and status is active, ensure subscribed is true
      if (subscriptionEnd && subscriptionEnd > now && (subData.subscription_status === 'active' || subData.subscription_status === 'trialing')) {
        subscribed = true;
      }

      // Determine subscription status
      let subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired' = subData.subscription_status as any || 'active';

      // If status is active or trialing, never mark as expired regardless of date
      if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
        subscribed = true;
        // Don't override status if it's already active/trialing
      } else {
        // Only mark as expired if date is past AND not in grace period
        if (isExpiredByDate && !isInGracePeriod) {
          subscriptionStatus = 'expired';
        }
      }

      // Ensure isExpired is false if status is active or trialing (even if subscription_end is null or in past)
      const isExpired = (subscriptionStatus === 'active' || subscriptionStatus === 'trialing')
        ? false
        : (isExpiredByDate && !isInGracePeriod);

      const mappedData: SubscriptionData = {
        subscribed: subscribed || isInGracePeriod,
        subscription_tier: subData.subscription_tier as 'basic' | 'pro',
        subscription_end: subData.subscription_end,
        subscription_status: subscriptionStatus,
        grace_period_ends_at: subData.grace_period_ends_at,
        isInGracePeriod,
        isExpired,
      };

      // Mapped subscription data

      setSubscriptionData(mappedData);
      // Store with TTL (5 minutes) for performance optimization
      const dataWithTTL = {
        data: mappedData,
        expiry: now.getTime() + (5 * 60 * 1000)
      };
      sessionStorage.setItem('subscription_data', JSON.stringify(dataWithTTL));
      sessionStorage.setItem(cacheKey, now.getTime().toString());
      setSubscriptionLoading(false);
      return;
    } catch (error) {
      // Expected fallback - use edge function instead
      // Keep loading state true as we're about to call edge function
    }

    try {
      // Already set to true in try block above, but ensure it's set
      if (!subscriptionLoading) {
        setSubscriptionLoading(true);
      }
      // Calling check-subscription edge function

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionToUse.access_token}`,
        },
      });

      if (error) {
        // Edge function error, using default
        // Don't return empty - set a reasonable default
        const defaultData = { subscribed: false };
        setSubscriptionData(defaultData);
        sessionStorage.removeItem('subscription_data');
        return;
      }

      // Edge function response received
      
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

      // Cache the subscription data with TTL (5 minutes) for performance optimization
      const dataWithTTL = {
        data: mappedData,
        expiry: now + (5 * 60 * 1000)
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
    // Track if this is the initial load to distinguish manual vs automatic sign-outs
    let isInitialLoad = true;

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

          // If this is not the initial load and we had a user, it means the session was terminated
          // This could be due to concurrent login from another device or session expiry
          if (!isInitialLoad && user) {
            // The session timeout hook or manual signout will handle the redirect
            // We don't show a toast here as it could be a normal logout
          }
        } else if (event === 'SIGNED_IN') {
          // Check subscription after successful sign-in with a delay
          setTimeout(() => {
            refreshSubscription(session);
          }, 1500);
          // Clear session tracking flag on new sign-in to allow re-tracking
          // This will be handled by useMultipleSessionDetection hook
        }

        // After first event, no longer initial load
        if (isInitialLoad) {
          isInitialLoad = false;
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

      // Mark initial load as complete after getting initial session
      setTimeout(() => {
        isInitialLoad = false;
      }, 3000);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Deactivate session in database before clearing local storage
    if (user) {
      const sessionId = sessionStorage.getItem(`session_id_${user.id}`);
      if (sessionId) {
        try {
          // Deactivate this session in the database
          await supabase.functions.invoke('track-session', {
            body: {
              action: 'deactivate_session',
              sessionId: sessionId,
              userId: user.id,
            },
          });
        } catch (error) {
          // Don't block logout if session deactivation fails
          // Error deactivating session on logout
        }
      }
      // Clear session tracking from sessionStorage
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
