import { SubscriptionData } from '@/hooks/useAuth';

export type SubscriptionAccessLevel = 'full' | 'readonly' | 'blocked';

/**
 * Determines the access level based on subscription status
 */
export function getSubscriptionAccessLevel(subscriptionData: SubscriptionData): SubscriptionAccessLevel {
  if (!subscriptionData.subscribed) {
    return 'blocked';
  }

  // Check if subscription is expired
  if (subscriptionData.isExpired) {
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

  if (subscriptionData.subscription_status === 'canceled' || subscriptionData.subscription_status === 'expired') {
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

  return 'full';
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
  if (subscriptionData.subscription_status === 'past_due') {
    return 'past_due';
  }

  if (subscriptionData.isInGracePeriod) {
    return 'grace_period';
  }

  if (subscriptionData.isExpired || subscriptionData.subscription_status === 'expired') {
    return 'expired';
  }

  return null;
}

