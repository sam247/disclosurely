import { SubscriptionData } from '@/hooks/useAuth';

export type SubscriptionAccessLevel = 'full' | 'readonly' | 'blocked';

/**
 * Determines the access level based on subscription status
 */
export function getSubscriptionAccessLevel(subscriptionData: SubscriptionData): SubscriptionAccessLevel {
  // If subscription_status is 'active' or 'trialing', ALWAYS grant full access
  // This takes precedence over any date checks
  if (subscriptionData.subscription_status === 'active' || subscriptionData.subscription_status === 'trialing') {
    return 'full';
  }

  // Check if subscription is explicitly expired
  if (subscriptionData.isExpired && !subscriptionData.isInGracePeriod) {
    return 'blocked';
  }

  // Check if in grace period (read-only access)
  if (subscriptionData.isInGracePeriod) {
    return 'readonly';
  }

  // Check subscription status
  if (subscriptionData.subscription_status === 'past_due') {
    return 'readonly';
  }

  if (subscriptionData.subscription_status === 'canceled') {
    // Canceled subscriptions can still have grace period
    if (subscriptionData.isInGracePeriod) {
      return 'readonly';
    }
    return 'blocked';
  }

  if (subscriptionData.subscription_status === 'expired') {
    // Expired subscriptions can still have grace period
    if (subscriptionData.isInGracePeriod) {
      return 'readonly';
    }
    return 'blocked';
  }

  // Check subscription_end date
  if (subscriptionData.subscription_end) {
    const subscriptionEnd = new Date(subscriptionData.subscription_end);
    const now = new Date();
    
    if (subscriptionEnd < now) {
      // Expired, check grace period
      if (subscriptionData.isInGracePeriod) {
        return 'readonly';
      }
      return 'blocked';
    }
  }

  // If subscribed is true and no other restrictions, grant full access
  if (subscriptionData.subscribed) {
    return 'full';
  }

  return 'blocked';
}

/**
 * Checks if user can perform write operations
 */
export function canWrite(subscriptionData: SubscriptionData): boolean {
  return getSubscriptionAccessLevel(subscriptionData) === 'full';
}

/**
 * Checks if user can access the platform at all
 */
export function canAccess(subscriptionData: SubscriptionData): boolean {
  const accessLevel = getSubscriptionAccessLevel(subscriptionData);
  return accessLevel === 'full' || accessLevel === 'readonly';
}

/**
 * Gets the subscription status for display in modals
 */
export function getSubscriptionStatusForModal(subscriptionData: SubscriptionData): 'expired' | 'past_due' | 'grace_period' | null {
  // Don't show modal if subscription is active or trialing - ALWAYS allow access
  if (subscriptionData.subscription_status === 'active' || subscriptionData.subscription_status === 'trialing') {
    return null;
  }
  
  // Also don't show modal if subscribed is true and status is not explicitly expired/canceled
  if (subscriptionData.subscribed && subscriptionData.subscription_status !== 'expired' && subscriptionData.subscription_status !== 'canceled') {
    return null;
  }

  if (subscriptionData.subscription_status === 'past_due') {
    return 'past_due';
  }

  if (subscriptionData.isInGracePeriod) {
    return 'grace_period';
  }

  // Only return 'expired' if status is explicitly expired AND not in grace period
  if (subscriptionData.subscription_status === 'expired' && !subscriptionData.isInGracePeriod) {
    return 'expired';
  }

  // Only return 'expired' if isExpired is true AND not in grace period
  if (subscriptionData.isExpired && !subscriptionData.isInGracePeriod) {
    return 'expired';
  }

  return null;
}

