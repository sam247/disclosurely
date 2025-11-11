
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, FileText, Shield, Zap } from 'lucide-react';
import { useUsageStats } from '@/hooks/useUsageStats';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useAuth } from '@/hooks/useAuth';

const SubscriptionManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { subscriptionData, refreshSubscription } = useAuth();
  const { stats, loading: statsLoading, formatStorage } = useUsageStats();
  const { 
    limits, 
    isAtCaseLimit, 
    isAtStorageLimit, 
    getCaseUsagePercentage, 
    getStorageUsagePercentage,
    formatStorageLimit,
    formatCaseLimit
  } = useSubscriptionLimits();

  

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      // Call Supabase edge function to create customer portal session
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Call Supabase edge function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          tier: subscriptionData.subscription_tier === 'basic' ? 'tier2' : 'tier1',
          employee_count: '50+'
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get subscription details based on the auth context data
  const getSubscriptionDetails = () => {
    if (!subscriptionData.subscribed) {
      return {
        plan: 'Free',
        status: 'free',
        currentPeriodEnd: null,
        price: 0,
        features: ['No cases allowed', 'No storage', 'Community support only']
      };
    }

    if (subscriptionData.subscription_tier === 'basic') {
      return {
        plan: 'Starter',
        price: 19.99,
        status: 'active',
        currentPeriodEnd: subscriptionData.subscription_end,
        features: ['5 cases per month', '1GB storage', 'Email support']
      };
    }

    if (subscriptionData.subscription_tier === 'pro') {
      return {
        plan: 'Pro',
        price: 49.99,
        status: 'active',
        currentPeriodEnd: subscriptionData.subscription_end,
        features: [
          'Unlimited cases per month',
          'Unlimited storage',
          'Email Support',
          'Secure two-way Messaging',
          'AI Case Helper',
          'Custom branding'
        ]
      };
    }

    return {
      plan: 'Free',
      status: 'free',
      currentPeriodEnd: null,
      price: 0,
      features: ['No cases allowed', 'No storage', 'Community support only']
    };
  };

  const subscription = getSubscriptionDetails();

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refreshSubscription()}
              className="ml-auto"
            >
              Refresh Status
            </Button>
          </CardTitle>
          <CardDescription>
            Manage your subscription plan and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{subscription.plan}</p>
              <p className="text-gray-600">
                £{subscription.price}/month
              </p>
            </div>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status === 'active' ? 'Active' : 'Free'}
            </Badge>
          </div>

          {subscription.currentPeriodEnd && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex space-x-2">
            {subscription.status === 'active' && (
              <Button 
                onClick={handleManageSubscription}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Manage Subscription'}
              </Button>
            )}
            
            {subscription.plan !== 'Pro' && (
              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : subscription.plan === 'Free' ? 'Subscribe Now' : 'Upgrade Plan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Plan Features</span>
          </CardTitle>
          <CardDescription>
            Features included in your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {subscription.features?.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Usage This Month</span>
          </CardTitle>
          <CardDescription>
            Track your monthly usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading usage statistics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.reportsThisMonth}</p>
                  <p className="text-sm text-gray-600">Cases This Month</p>
                  <p className="text-xs text-gray-500">{formatCaseLimit()}</p>
                  {limits.maxCasesPerMonth > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${isAtCaseLimit() ? 'bg-red-600' : 'bg-blue-600'}`}
                        style={{ width: `${getCaseUsagePercentage()}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{formatStorage(stats.storageUsed)}</p>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-xs text-gray-500">{formatStorageLimit()} limit</p>
                {limits.maxStorageGB > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${isAtStorageLimit() ? 'bg-red-600' : 'bg-purple-600'}`}
                      style={{ width: `${getStorageUsagePercentage()}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
