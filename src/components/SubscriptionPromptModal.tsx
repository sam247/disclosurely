import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionPromptModal = ({ open, onOpenChange }: SubscriptionPromptModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (plan: 'starter' | 'pro') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: { 
          tier: plan === 'starter' ? 'tier1' : 'tier2',
          employee_count: plan === 'starter' ? '0-49' : '50+'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutSubscription = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Welcome to Disclosurely!</DialogTitle>
          <DialogDescription className="text-lg">
            Choose a plan to start collecting secure reports from your organization
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Starter Plan */}
          <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-2 bg-blue-100 rounded-full w-fit">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Starter</CardTitle>
              <CardDescription>Perfect for small organizations</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">£9.99</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">5 cases/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">1GB Storage</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Email Support</span>
                </li>
              </ul>
              <Button 
                onClick={() => handleSubscribe('starter')}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Start Starter Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-500 shadow-lg">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-2 bg-blue-100 rounded-full w-fit">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Pro</CardTitle>
              <CardDescription>For growing organizations</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">£19.99</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Unlimited cases/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Unlimited storage</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Secure two-way Messaging</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">AI Case Helper</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Custom branding</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Email Support</span>
                </li>
              </ul>
              <Button 
                onClick={() => handleSubscribe('pro')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Start Pro Plan'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">
            Not ready to subscribe? You can explore the dashboard with limited functionality.
          </p>
          <Button 
            variant="ghost" 
            onClick={handleContinueWithoutSubscription}
            className="text-gray-600 hover:text-gray-800"
          >
            Continue without subscription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPromptModal;
