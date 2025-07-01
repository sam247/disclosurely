
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Eye, 
  Lock, 
  TrendingUp,
  Users,
  Clock,
  Globe
} from 'lucide-react';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  activeUsers: number;
  suspiciousActivities: number;
  riskScore: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const SecurityMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    activeUsers: 0,
    suspiciousActivities: 0,
    riskScore: 0
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  useEffect(() => {
    fetchSecurityMetrics();
    fetchSecurityAlerts();
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      if (realTimeEnabled) {
        fetchSecurityMetrics();
        fetchSecurityAlerts();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  const fetchSecurityMetrics = async () => {
    if (!user) return;

    try {
      // Get metrics from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', yesterday.toISOString());

      if (error) throw error;

      const totalEvents = auditLogs?.length || 0;
      const criticalEvents = auditLogs?.filter(log => log.risk_level === 'critical').length || 0;
      const failedLogins = auditLogs?.filter(log => 
        log.event_type === 'authentication' && log.result === 'failure'
      ).length || 0;
      
      // Calculate suspicious activities (multiple failed logins, unusual IP patterns, etc.)
      const suspiciousActivities = auditLogs?.filter(log => 
        log.risk_level === 'high' || log.risk_level === 'critical'
      ).length || 0;

      // Calculate risk score (0-100)
      const riskScore = Math.min(100, (criticalEvents * 10) + (suspiciousActivities * 5) + failedLogins);

      // Get active users count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      setMetrics({
        totalEvents,
        criticalEvents,
        failedLogins,
        activeUsers: profiles?.length || 0,
        suspiciousActivities,
        riskScore
      });
    } catch (error: any) {
      console.error('Error fetching security metrics:', error);
    }
  };

  const fetchSecurityAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error && error.code !== 'PGRST116') { // Ignore table not found
        throw error;
      }

      setAlerts(data || []);
    } catch (error: any) {
      console.error('Error fetching security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Alert Resolved",
        description: "Security alert has been marked as resolved",
      });
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve security alert",
        variant: "destructive",
      });
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-600 bg-red-50' };
    if (score >= 60) return { level: 'High', color: 'text-orange-600 bg-orange-50' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600 bg-green-50' };
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const riskData = getRiskLevel(metrics.riskScore);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
              <CardDescription>
                Real-time security monitoring and threat detection
              </CardDescription>
            </div>
            <Button 
              variant={realTimeEnabled ? "default" : "outline"}
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {realTimeEnabled ? 'Live' : 'Enable Live'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Activity className="h-3 w-3" />
                Total Events (24h)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Critical Events
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.failedLogins}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Failed Logins
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                Active Users
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Organization Risk Score</span>
              <Badge className={riskData.color}>
                {riskData.level}
              </Badge>
            </div>
            <Progress value={metrics.riskScore} className="h-3" />
            <div className="text-xs text-gray-500">
              Score: {metrics.riskScore}/100 - Based on recent security events and anomalies
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Security Alerts
          </CardTitle>
          <CardDescription>
            Unresolved security incidents requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active security alerts</p>
              <p className="text-sm">Your system is currently secure</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                        <Badge className={`text-xs ${
                          alert.severity === 'critical' ? 'bg-red-600' :
                          alert.severity === 'high' ? 'bg-orange-600' :
                          alert.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        } text-white`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{alert.message}</p>
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Security Actions
          </CardTitle>
          <CardDescription>
            Quick security management actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Eye className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">View Logs</div>
                <div className="text-xs text-gray-500">Review audit trail</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Lock className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Lock Accounts</div>
                <div className="text-xs text-gray-500">Suspend suspicious users</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Globe className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">IP Analysis</div>
                <div className="text-xs text-gray-500">Review access patterns</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;
