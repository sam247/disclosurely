
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Users, FileText, Shield, Zap } from 'lucide-react';
import { useUsageStats } from '@/hooks/useUsageStats';

const SubscriptionManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { stats, loading: statsLoading, formatStorage } = useUsageStats();

  // Mock subscription data - replace with actual Supabase query
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      // Mock data for now
      return {
        plan: 'Tier 2',
        status: 'active',
        currentPeriodEnd: '2025-02-01',
        price: 49,
        features: [
          'Unlimited Reports',
          'Advanced Analytics',
          'Priority Support',
          'Custom Branding',
          'API Access'
        ]
      };
    },
  });

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
        body: { priceId: 'price_tier3' } // Replace with actual price ID
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

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
          <CardDescription>
            Manage your subscription plan and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{subscription?.plan || 'Free Tier'}</p>
              <p className="text-gray-600">
                ${subscription?.price || 0}/month
              </p>
            </div>
            <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
              {subscription?.status || 'Free'}
            </Badge>
          </div>

          {subscription?.currentPeriodEnd && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
            
            {subscription?.plan !== 'Tier 3' && (
              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Upgrade Plan'}
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
            {subscription?.features?.map((feature, index) => (
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
                  <p className="text-sm text-gray-600">Reports Submitted</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{formatStorage(stats.storageUsed)}</p>
                <p className="text-sm text-gray-600">Storage Used</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
