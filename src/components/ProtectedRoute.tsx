
import { ReactNode, useState, useEffect } from 'react';
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

  // Check subscription status when data is available - only show modal if there's actually an issue
  useEffect(() => {
    // Only check if everything is loaded and user is authenticated
    if (!loading && !subscriptionLoading && user && subscriptionData) {
      const hasAccess = canAccess(subscriptionData);
      const statusForModal = getSubscriptionStatusForModal(subscriptionData);
      
      // Only show modal if:
      // 1. User doesn't have access AND subscription data is explicitly loaded (not default)
      // 2. There's a specific status that requires showing the modal
      // Don't show if subscription is active/trialing or if data is still defaulting
      if (!hasAccess && subscriptionData.subscription_status !== undefined) {
        // Only show if there's a specific status that requires the modal
        if (statusForModal) {
          setShowSubscriptionModal(true);
        }
      } else {
        // Hide modal if user has access or subscription is active
        setShowSubscriptionModal(false);
      }
    } else {
      // Hide modal while loading
      setShowSubscriptionModal(false);
    }
  }, [loading, subscriptionLoading, user, subscriptionData]);

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check subscription access - only block if subscriptionData is loaded and explicitly shows no access
  // Don't block if subscriptionData is still loading or is default/undefined
  if (subscriptionData && !subscriptionLoading && !canAccess(subscriptionData)) {
    const statusForModal = getSubscriptionStatusForModal(subscriptionData);
    return (
      <>
        <SubscriptionExpiredModal
          open={true}
          subscriptionStatus={statusForModal || 'expired'}
          gracePeriodEndsAt={subscriptionData.grace_period_ends_at}
          onManageSubscription={() => {
            // Navigate to settings page
            window.location.href = '/dashboard/settings';
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
      {showSubscriptionModal && (
        <SubscriptionExpiredModal
          open={showSubscriptionModal}
          subscriptionStatus={getSubscriptionStatusForModal(subscriptionData) || 'expired'}
          gracePeriodEndsAt={subscriptionData?.grace_period_ends_at}
          onManageSubscription={() => {
            setShowSubscriptionModal(false);
            // Navigate to settings page
            window.location.href = '/dashboard/settings';
          }}
        />
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
