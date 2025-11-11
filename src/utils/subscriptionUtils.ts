import { SubscriptionData } from '@/hooks/useAuth';

export type SubscriptionAccessLevel = 'full' | 'readonly' | 'blocked';

/**
 * Determines the access level based on subscription status
 */
export function getSubscriptionAccessLevel(subscriptionData: SubscriptionData): SubscriptionAccessLevel {
  // If subscription_status is 'active' or 'trialing', grant full access (even if dates suggest otherwise)
  if (subscriptionData.subscription_status === 'active' || subscriptionData.subscription_status === 'trialing') {
    // Double-check that subscription_end is in the future
    if (subscriptionData.subscription_end) {
      const subscriptionEnd = new Date(subscriptionData.subscription_end);
      const now = new Date();
      if (subscriptionEnd > now) {
        return 'full';
      }
      // If date is past but status is active, check grace period
      if (subscriptionData.isInGracePeriod) {
        return 'readonly';
      }
    } else {
      // No end date but status is active - grant access
      return 'full';
    }
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

