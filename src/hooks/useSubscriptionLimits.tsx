import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUsageStats } from './useUsageStats';

interface SubscriptionLimits {
  maxCasesPerMonth: number;
  maxStorageGB: number;
  hasMessaging: boolean;
  hasAIHelper: boolean;
  hasCustomBranding: boolean;
}

export const useSubscriptionLimits = () => {
  const { subscriptionData } = useAuth();
  const { stats } = useUsageStats();
  const [limits, setLimits] = useState<SubscriptionLimits>({
    maxCasesPerMonth: 0,
    maxStorageGB: 0,
    hasMessaging: false,
    hasAIHelper: false,
    hasCustomBranding: false,
  });

  useEffect(() => {
    const tier = subscriptionData.subscription_tier;
    const isSubscribed = subscriptionData.subscribed;
    
    // Only allow features if user has an active subscription
    if (isSubscribed && tier === 'basic') {
      setLimits({
        maxCasesPerMonth: 5,
        maxStorageGB: 1,
        hasMessaging: false,
        hasAIHelper: false,
        hasCustomBranding: false,
      });
    } else if (isSubscribed && tier === 'pro') {
      setLimits({
        maxCasesPerMonth: -1, // -1 means unlimited
        maxStorageGB: -1, // -1 means unlimited
        hasMessaging: true,
        hasAIHelper: true,
        hasCustomBranding: true,
      });
    } else {
      // No subscription - no features allowed
      setLimits({
        maxCasesPerMonth: 0,
        maxStorageGB: 0,
        hasMessaging: false,
        hasAIHelper: false,
        hasCustomBranding: false,
      });
    }
  }, [subscriptionData.subscription_tier, subscriptionData.subscribed]);

  const isAtCaseLimit = () => {
    if (limits.maxCasesPerMonth === -1) return false; // unlimited
    if (limits.maxCasesPerMonth === 0) return true; // no access allowed
    return stats.reportsThisMonth >= limits.maxCasesPerMonth;
  };

  const hasAnySubscription = () => {
    return subscriptionData.subscribed;
  };

  const isAtStorageLimit = () => {
    if (limits.maxStorageGB === -1) return false; // unlimited
    const storageUsedGB = stats.storageUsed / (1024 * 1024 * 1024);
    return storageUsedGB >= limits.maxStorageGB;
  };

  const getCaseUsagePercentage = () => {
    if (limits.maxCasesPerMonth === -1) return 0; // unlimited
    return Math.min((stats.reportsThisMonth / limits.maxCasesPerMonth) * 100, 100);
  };

  const getStorageUsagePercentage = () => {
    if (limits.maxStorageGB === -1) return 0; // unlimited
    const storageUsedGB = stats.storageUsed / (1024 * 1024 * 1024);
    return Math.min((storageUsedGB / limits.maxStorageGB) * 100, 100);
  };

  const formatStorageLimit = () => {
    if (limits.maxStorageGB === -1) return 'Unlimited';
    if (limits.maxStorageGB < 1) return `${Math.round(limits.maxStorageGB * 1024)}MB`;
    return `${limits.maxStorageGB}GB`;
  };

  const formatCaseLimit = () => {
    if (limits.maxCasesPerMonth === -1) return 'Unlimited';
    return `${limits.maxCasesPerMonth} per month`;
  };

  return {
    limits,
    isAtCaseLimit,
    isAtStorageLimit,
    getCaseUsagePercentage,
    getStorageUsagePercentage,
    formatStorageLimit,
    formatCaseLimit,
    hasAnySubscription,
  };
};