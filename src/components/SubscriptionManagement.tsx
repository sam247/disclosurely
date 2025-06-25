
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Users, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  employee_count?: string;
}

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      console.log('Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }

      console.log('Subscription data received:', data);
      setSubscriptionData(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error checking subscription",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createCheckoutSession = async (tier: string, employeeCount: number) => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Creating checkout session for:', { tier, employeeCount });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, employee_count: employeeCount },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      console.log('Checkout session created:', data);
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error creating checkout",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Opening customer portal...');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      console.log('Customer portal session created:', data);
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error opening customer portal",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Manage your Disclosurely subscription
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkSubscription}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptionData.subscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active Subscription
                </Badge>
                <span className="text-sm text-gray-600">
                  {subscriptionData.subscription_tier} - {subscriptionData.employee_count} employees
                </span>
              </div>
              {subscriptionData.subscription_end && (
                <p className="text-sm text-gray-600">
                  Next billing: {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                </p>
              )}
              <Button onClick={openCustomerPortal} className="mt-4">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="secondary">No Active Subscription</Badge>
              <p className="text-sm text-gray-600">
                Choose a plan below to start using Disclosurely's secure reporting platform.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      {!subscriptionData.subscribed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tier 1 */}
          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tier 1
              </CardTitle>
              <CardDescription>Perfect for small organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">£30</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">0-49 employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Secure messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Dashboard & analytics</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => createCheckoutSession('tier1', 25)}
                disabled={loading}
              >
                Subscribe to Tier 1
              </Button>
            </CardContent>
          </Card>

          {/* Tier 2 */}
          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tier 2
              </CardTitle>
              <CardDescription>Ideal for medium organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">£50</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">50-199 employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Secure messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Dashboard & analytics</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => createCheckoutSession('tier2', 125)}
                disabled={loading}
              >
                Subscribe to Tier 2
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tier 3 Contact */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Enterprise (200+ employees)</CardTitle>
          <CardDescription>
            For large organizations with 200+ employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Need a custom solution for your large organization? Contact us for enterprise pricing and features.
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
