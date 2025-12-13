
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SubscriptionManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscriptionData, refreshSubscription } = useAuth();

  

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call Supabase edge function to create customer portal session
      const { data, error: invokeError } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (invokeError) {
        console.error('Error accessing customer portal:', invokeError);
        setError(invokeError.message || 'Failed to open customer portal. Please try again.');
        throw invokeError;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        setError(data.error);
      } else {
        setError('No portal URL returned. Please contact support.');
      }
    } catch (error: any) {
      console.error('Error accessing customer portal:', error);
      setError(error?.message || 'Failed to open customer portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Call Supabase edge function to create checkout session
      // If user has 'basic' (Starter), upgrade to 'tier2' (Pro)
      // If user has 'pro', they're already on the highest tier
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          tier: subscriptionData.subscription_tier === 'basic' ? 'tier2' : 'tier1',
          employee_count: '50+',
          interval: 'month' // Default to monthly for upgrades
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
      {/* Consolidated Subscription & Features Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Current Subscription</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshSubscription(null, true)}
            >
              Refresh Status
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subscription Info */}
          <div className="space-y-4">
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

            <div className="flex flex-col space-y-2">
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
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Plan Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <h3 className="font-semibold">Plan Features</h3>
            </div>
            <div className="grid gap-3">
              {subscription.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
