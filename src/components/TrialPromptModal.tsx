import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrialPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrialPromptModal = ({ open, onOpenChange }: TrialPromptModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStartTrial = async (plan: 'basic' | 'pro') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan,
          mode: 'subscription' 
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Error",
          description: "Failed to start trial. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Trial start error:', error);
      toast({
        title: "Error", 
        description: "Failed to start trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Start Your Free Trial
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Choose a plan to unlock all features and start managing reports securely.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Basic Plan */}
          <Card className="relative border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Basic</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold">$29</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>
              <CardDescription>
                Perfect for small organizations getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">5 cases per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">1GB storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Secure anonymous reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic analytics</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleStartTrial('basic')}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Starting...' : 'Start Basic Trial'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-500 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="h-3 w-3" />
                Most Popular
              </div>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold">$99</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>
              <CardDescription>
                Complete solution for organizations of any size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Unlimited cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Unlimited storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">AI case analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Two-way messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Custom branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Custom domains</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleStartTrial('pro')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Starting...' : 'Start Pro Trial'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-600 mt-4">
          <p>Start your 14-day free trial • No credit card required • Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialPromptModal;