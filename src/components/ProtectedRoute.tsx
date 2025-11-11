
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
  const { user, loading, subscriptionData, subscriptionLoading } = useAuth();
  const location = useLocation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Check subscription status when data is available
  useEffect(() => {
    if (!loading && !subscriptionLoading && user && subscriptionData) {
      const hasAccess = canAccess(subscriptionData);
      const statusForModal = getSubscriptionStatusForModal(subscriptionData);
      
      if (!hasAccess || statusForModal) {
        setShowSubscriptionModal(true);
      }
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

  // Check subscription access
  if (!canAccess(subscriptionData)) {
    const statusForModal = getSubscriptionStatusForModal(subscriptionData);
    return (
      <>
        <SubscriptionExpiredModal
          open={true}
          subscriptionStatus={statusForModal || 'expired'}
          gracePeriodEndsAt={subscriptionData.grace_period_ends_at}
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
          gracePeriodEndsAt={subscriptionData.grace_period_ends_at}
          onManageSubscription={() => setShowSubscriptionModal(false)}
        />
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
