
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Users, Database, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  activeAlerts: number;
}

const SecurityMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch security alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) {
        console.error('Error fetching security alerts:', alertsError);
        // If table doesn't exist yet, show empty state
        if (alertsError.code === 'PGRST116' || alertsError.message?.includes('does not exist')) {
          setAlerts([]);
        } else {
          throw alertsError;
        }
      } else {
        // Ensure data matches our interface
        const typedAlerts: SecurityAlert[] = (alertsData || []).map(item => ({
          id: item.id,
          type: item.type,
          severity: item.severity as 'low' | 'medium' | 'high' | 'critical',
          message: item.message,
          details: item.details,
          resolved: item.resolved,
          resolved_at: item.resolved_at,
          resolved_by: item.resolved_by,
          created_at: item.created_at,
        }));
        setAlerts(typedAlerts);
      }

      // Fetch audit logs for metrics
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('event_type, result, risk_level')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (auditError) {
        console.error('Error fetching audit data:', auditError);
        // Continue with empty metrics if audit_logs doesn't exist
      } else if (auditData) {
        const totalEvents = auditData.length;
        const failedLogins = auditData.filter(event => 
          event.event_type === 'authentication' && event.result === 'failure'
        ).length;
        const suspiciousActivity = auditData.filter(event => 
          event.risk_level === 'high' || event.risk_level === 'critical'
        ).length;
        const activeAlerts = (alertsData || []).filter(alert => !alert.resolved).length;

        setMetrics({
          totalEvents,
          failedLogins,
          suspiciousActivity,
          activeAlerts
        });
      }
    } catch (error: any) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security monitoring data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "Security alert has been marked as resolved",
      });

      // Refresh data
      fetchSecurityData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Real-time security monitoring and threat detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Events (24h)</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics.totalEvents}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Failed Logins</p>
                  <p className="text-2xl font-bold text-red-900">{metrics.failedLogins}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Suspicious Activity</p>
                  <p className="text-2xl font-bold text-orange-900">{metrics.suspiciousActivity}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-yellow-900">{metrics.activeAlerts}</p>
                </div>
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>
            Active security incidents requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No security alerts</p>
                <p className="text-sm">Your system is secure</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(alert.severity)}
                          <span className="font-medium">{alert.message}</span>
                          <Badge className={`text-xs ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-xs">
                              RESOLVED
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Type: {alert.type}</div>
                          <div>Created: {format(new Date(alert.created_at), 'MMM dd, HH:mm:ss')}</div>
                          {alert.resolved_at && (
                            <div>Resolved: {format(new Date(alert.resolved_at), 'MMM dd, HH:mm:ss')}</div>
                          )}
                          
                          {alert.details && Object.keys(alert.details).length > 0 && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                View Details
                              </summary>
                              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(alert.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      
                      {!alert.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;
