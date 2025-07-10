import { AlertTriangle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface FeatureRestrictionProps {
  feature: string;
  requiredTier: 'starter' | 'pro';
  onUpgrade?: () => void;
}

const FeatureRestriction = ({ feature, requiredTier, onUpgrade }: FeatureRestrictionProps) => {
  const { subscriptionData } = useAuth();
  
  const getTierName = (tier: string) => {
    return tier === 'starter' ? 'Starter' : 'Pro';
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Lock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{feature} requires {getTierName(requiredTier)} plan</p>
            <p className="text-sm text-orange-700 mt-1">
              Upgrade your subscription to access this feature
            </p>
          </div>
          {onUpgrade && (
            <Button 
              size="sm" 
              onClick={onUpgrade}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Upgrade Now
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default FeatureRestriction;