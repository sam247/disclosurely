import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionExpiredModalProps {
  open: boolean;
  subscriptionStatus: 'expired' | 'past_due' | 'grace_period';
  gracePeriodEndsAt?: string;
  onManageSubscription?: () => void;
}

const SubscriptionExpiredModal = ({
  open,
  subscriptionStatus,
  gracePeriodEndsAt,
  onManageSubscription
}: SubscriptionExpiredModalProps) => {
  const navigate = useNavigate();

  const handleManageSubscription = () => {
    if (onManageSubscription) {
      onManageSubscription();
    } else {
      navigate('/dashboard/settings?tab=subscription');
    }
  };

  const isGracePeriod = subscriptionStatus === 'grace_period';
  const isPastDue = subscriptionStatus === 'past_due';

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isGracePeriod ? (
              <Clock className="h-6 w-6 text-yellow-600" />
            ) : isPastDue ? (
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            )}
            <AlertDialogTitle>
              {isGracePeriod 
                ? 'Subscription Expired - Grace Period Active'
                : isPastDue
                ? 'Payment Failed - Subscription Past Due'
                : 'Subscription Expired'
              }
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            {isGracePeriod ? (
              <>
                <p>
                  Your subscription has expired, but you're currently in a 7-day grace period. 
                  During this time, you have read-only access to your data.
                </p>
                {gracePeriodEndsAt && (
                  <p className="text-sm text-muted-foreground">
                    Grace period ends: {new Date(gracePeriodEndsAt).toLocaleString()}
                  </p>
                )}
                <p className="font-medium">
                  Please renew your subscription to restore full access to all features.
                </p>
              </>
            ) : isPastDue ? (
              <>
                <p>
                  Your payment failed and your subscription is now past due. 
                  Please update your payment method to restore full access.
                </p>
                <p className="font-medium">
                  You currently have read-only access to your data.
                </p>
              </>
            ) : (
              <>
                <p>
                  Your subscription has expired and the grace period has ended. 
                  Full access to the platform has been restricted.
                </p>
                <p className="font-medium">
                  Please renew your subscription to restore access to all features.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleManageSubscription}
            className="w-full sm:w-auto"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubscriptionExpiredModal;

