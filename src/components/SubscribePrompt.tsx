import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface SubscribePromptProps {
  feature: string;
  description?: string;
}

const SubscribePrompt = ({ feature, description }: SubscribePromptProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Call Supabase edge function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'price_basic' }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl text-orange-800">
          {feature} Requires Subscription
        </CardTitle>
        <CardDescription className="text-orange-700">
          {description || `Upgrade to Basic or Pro to access ${feature.toLowerCase()}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">Basic Plan</h3>
            <p className="text-2xl font-bold text-orange-600 mb-2">$19.99/mo</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>5 cases per month</li>
              <li>1GB storage</li>
              <li>Email support</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <h3 className="font-semibold text-gray-900 mb-2">Pro Plan</h3>
            <p className="text-2xl font-bold text-orange-600 mb-2">$49.99/mo</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Unlimited cases</li>
              <li>Unlimited storage</li>
              <li>All premium features</li>
            </ul>
          </div>
        </div>
        <Button 
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? 'Loading...' : (
            <>
              Subscribe Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscribePrompt;