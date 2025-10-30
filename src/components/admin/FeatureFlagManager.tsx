import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Info,
  Shield,
  BarChart3,
  Calendar,
  FileText,
  Brain
} from 'lucide-react';
import { useAllFeatureFlags, updateFeatureFlag } from '@/hooks/useFeatureFlag';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

const featureIcons: Record<string, React.ReactNode> = {
  ai_gateway: <Shield className="h-5 w-5" />,
  ai_gateway_multi_model: <Brain className="h-5 w-5" />,
  risk_compliance_module: <BarChart3 className="h-5 w-5" />,
  policy_tracker: <FileText className="h-5 w-5" />,
  risk_register: <AlertTriangle className="h-5 w-5" />,
  compliance_calendar: <Calendar className="h-5 w-5" />,
  ai_insights: <Brain className="h-5 w-5" />
};

export const FeatureFlagManager: React.FC = () => {
  const { data: flags, isLoading } = useAllFeatureFlags();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (featureName: string, enabled: boolean) => {
    setUpdating(featureName);
    try {
      await updateFeatureFlag(featureName, { is_enabled: enabled });
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flag'] });
      
      toast({
        title: enabled ? 'Feature Enabled' : 'Feature Disabled',
        description: `${featureName} has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feature flag',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRolloutChange = async (featureName: string, percentage: number) => {
    try {
      await updateFeatureFlag(featureName, { rollout_percentage: percentage });
      
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      
      toast({
        title: 'Rollout Updated',
        description: `${featureName} now rolled out to ${percentage}% of organizations`,
      });
    } catch (error) {
      console.error('Error updating rollout:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rollout percentage',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Feature Flags</h2>
          <p className="text-gray-500 mt-1">
            Control feature rollout and instant rollback
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Flag className="h-4 w-4" />
          {flags?.filter(f => f.is_enabled).length || 0} / {flags?.length || 0} Enabled
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Safety First:</strong> All new features are disabled by default. Enable for testing, then gradually roll out to production.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {flags?.map((flag) => {
          const icon = featureIcons[flag.feature_name] || <Flag className="h-5 w-5" />;
          const isUpdating = updating === flag.feature_name;
          
          return (
            <Card key={flag.id} className={flag.is_enabled ? 'border-green-200' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {icon}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {flag.feature_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {flag.is_enabled ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {flag.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Switch
                    checked={flag.is_enabled}
                    disabled={isUpdating}
                    onCheckedChange={(checked) => handleToggle(flag.feature_name, checked)}
                  />
                </div>
              </CardHeader>
              
              {flag.is_enabled && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                          Rollout Percentage
                        </label>
                        <span className="text-sm text-gray-500">
                          {flag.rollout_percentage}%
                        </span>
                      </div>
                      <Slider
                        value={[flag.rollout_percentage]}
                        onValueChange={(values) => handleRolloutChange(flag.feature_name, values[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {flag.rollout_percentage === 0 && 'Feature disabled for all organizations'}
                        {flag.rollout_percentage > 0 && flag.rollout_percentage < 100 && `Feature enabled for ~${flag.rollout_percentage}% of organizations`}
                        {flag.rollout_percentage === 100 && 'Feature enabled for all organizations'}
                      </p>
                    </div>

                    {Object.keys(flag.organization_overrides || {}).length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Organization Overrides</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(flag.organization_overrides || {}).map(([orgId, enabled]) => (
                            <Badge
                              key={orgId}
                              variant={enabled ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {orgId.substring(0, 8)}... {enabled ? '✓' : '✗'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Emergency Disable All Button */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Emergency Controls
          </CardTitle>
          <CardDescription>
            Use these controls only in case of critical issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm('Are you sure you want to disable ALL features? This will revert to safe mode.')) {
                return;
              }
              
              setUpdating('all');
              try {
                for (const flag of flags || []) {
                  await updateFeatureFlag(flag.feature_name, { 
                    is_enabled: false,
                    rollout_percentage: 0
                  });
                }
                
                queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
                
                toast({
                  title: 'All Features Disabled',
                  description: 'System reverted to safe mode',
                });
              } catch (error) {
                toast({
                  title: 'Error',
                  description: 'Failed to disable all features',
                  variant: 'destructive',
                });
              } finally {
                setUpdating(null);
              }
            }}
            disabled={isUpdating}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Disable All Features (Emergency)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

