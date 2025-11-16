
import { ReactNode, useState, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedApp from './AuthenticatedApp';
import SubscriptionExpiredModal from './SubscriptionExpiredModal';
import { canAccess, getSubscriptionStatusForModal } from '@/utils/subscriptionUtils';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, subscriptionData, subscriptionLoading, refreshSubscription } = useAuth();
  const location = useLocation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const stabilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedRef = useRef(false);
  const lastSubscriptionStatusRef = useRef<string | undefined>(undefined);
  const subscriptionDataLoadedRef = useRef(false);

  // Track when subscription data has been explicitly loaded (not just default)
  useEffect(() => {
    // Reset loaded flag when loading starts
    if (loading || subscriptionLoading) {
      subscriptionDataLoadedRef.current = false;
      return;
    }

    // Mark as loaded only when loading is complete and we have actual data
    if (user) {
      // Check if subscriptionData has been explicitly loaded (has subscription_status or other indicators)
      // Must have either tier OR status to be considered real data
      const hasExplicitData = (subscriptionData.subscription_status !== undefined && subscriptionData.subscription_status !== null) ||
                              (subscriptionData.subscription_tier !== undefined && subscriptionData.subscription_tier !== null) ||
                              (subscriptionData.subscription_end !== undefined && subscriptionData.subscription_end !== null);

      if (hasExplicitData) {
        console.log('[ProtectedRoute] Subscription data loaded:', subscriptionData);
        subscriptionDataLoadedRef.current = true;
      } else {
        console.log('[ProtectedRoute] Waiting for subscription data...');
        subscriptionDataLoadedRef.current = false;
      }
    }
  }, [loading, subscriptionLoading, user, subscriptionData]);

  // Check subscription status when data is available - only show modal if there's actually an issue
  useEffect(() => {
    // Clear any existing timeout
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
      stabilityTimeoutRef.current = null;
    }

    // Always hide modal while loading
    if (loading || subscriptionLoading) {
      setShowSubscriptionModal(false);
      return;
    }

    // CRITICAL: Only check if user is authenticated and data is loaded
    if (!user || !subscriptionDataLoadedRef.current) {
      setShowSubscriptionModal(false);
      return;
    }

    // NEVER show modal for pro or basic tier users, regardless of status
    if (subscriptionData.subscription_tier === 'pro' || subscriptionData.subscription_tier === 'basic') {
      console.log('[ProtectedRoute] Pro/Basic user - hiding modal');
      setShowSubscriptionModal(false);
      hasCheckedRef.current = true;
      return;
    }

    // NEVER show modal if subscription is active or trialing
    if (subscriptionData.subscription_status === 'active' || subscriptionData.subscription_status === 'trialing') {
      console.log('[ProtectedRoute] Active/Trialing subscription - hiding modal');
      setShowSubscriptionModal(false);
      hasCheckedRef.current = true;
      return;
    }

    // Check if subscription status has changed (data is stable)
    const currentStatus = subscriptionData.subscription_status;
    const statusChanged = currentStatus !== lastSubscriptionStatusRef.current;

    // Wait for data to stabilize (prevent flashing during updates)
    stabilityTimeoutRef.current = setTimeout(() => {
      const hasAccess = canAccess(subscriptionData);
      const statusForModal = getSubscriptionStatusForModal(subscriptionData);

      console.log('[ProtectedRoute] Modal check:', {
        hasAccess,
        statusForModal,
        tier: subscriptionData.subscription_tier,
        status: subscriptionData.subscription_status,
        subscribed: subscriptionData.subscribed
      });

      // Only show modal if:
      // 1. User doesn't have access
      // 2. There's a specific status that requires showing the modal
      // 3. Status is not undefined (we have real data)
      const shouldShow = !hasAccess &&
                        statusForModal !== null &&
                        subscriptionData.subscription_status !== undefined;

      if (shouldShow && (statusChanged || !hasCheckedRef.current)) {
        console.log('[ProtectedRoute] Showing subscription modal');
        setShowSubscriptionModal(true);
        hasCheckedRef.current = true;
      } else {
        console.log('[ProtectedRoute] Hiding subscription modal');
        setShowSubscriptionModal(false);
        if (!hasCheckedRef.current) {
          hasCheckedRef.current = true;
        }
      }

      lastSubscriptionStatusRef.current = currentStatus;
    }, 300); // Wait 300ms for data to stabilize

    return () => {
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
        stabilityTimeoutRef.current = null;
      }
    };
  }, [loading, subscriptionLoading, user, subscriptionData]);

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check subscription access - only block if subscriptionData is loaded and explicitly shows no access
  // Don't block if subscriptionData is still loading or is default/undefined
  // NEVER block users with active/trialing status or pro/basic tier
  // MUST have explicit subscription data loaded before blocking anyone
  const shouldBlockAccess = subscriptionDataLoadedRef.current &&
                            !subscriptionLoading &&
                            subscriptionData.subscription_status !== 'active' &&
                            subscriptionData.subscription_status !== 'trialing' &&
                            subscriptionData.subscription_tier !== 'pro' &&
                            subscriptionData.subscription_tier !== 'basic' &&
                            !canAccess(subscriptionData);

  console.log('[ProtectedRoute] Block check:', {
    shouldBlockAccess,
    dataLoaded: subscriptionDataLoadedRef.current,
    subscriptionLoading,
    tier: subscriptionData?.subscription_tier,
    status: subscriptionData?.subscription_status
  });
  
  if (shouldBlockAccess) {
    const statusForModal = getSubscriptionStatusForModal(subscriptionData);
    return (
      <>
        <SubscriptionExpiredModal
          open={true}
          subscriptionStatus={statusForModal || 'expired'}
          gracePeriodEndsAt={subscriptionData.grace_period_ends_at}
          onManageSubscription={() => {
            setShowSubscriptionModal(false);
            // Use setTimeout to ensure modal closes before navigation
            setTimeout(() => {
              window.location.href = '/dashboard/settings?tab=subscription';
            }, 100);
          }}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">Please manage your subscription to continue.</p>
          </div>
        </div>
      </>
    );
  }

  // Use AuthenticatedApp only for /app routes
  if (location.pathname.startsWith('/app')) {
    return <AuthenticatedApp />;
  }

  return (
    <>
      {/* Only render modal if subscription data has been explicitly loaded AND modal should show */}
      {showSubscriptionModal && subscriptionDataLoadedRef.current && subscriptionData && (
        <SubscriptionExpiredModal
          open={showSubscriptionModal}
          subscriptionStatus={getSubscriptionStatusForModal(subscriptionData) || 'expired'}
          gracePeriodEndsAt={subscriptionData?.grace_period_ends_at}
          onManageSubscription={() => {
            setShowSubscriptionModal(false);
            // Use setTimeout to ensure modal closes before navigation
            setTimeout(() => {
              window.location.href = '/dashboard/settings?tab=subscription';
            }, 100);
          }}
        />
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
