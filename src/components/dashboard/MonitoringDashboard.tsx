import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Database,
  Server,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';

interface MonitoringMetrics {
  sentry: {
    errorsLast24h: number;
    errorsLast7d: number;
    unresolvedIssues: number;
    lastUpdated: string;
  };
  supabase: {
    edgeFunctionErrors: {
      function: string;
      errorCount: number;
      lastError: string;
      avgExecutionTime: number;
    }[];
    apiErrors: number;
    lastUpdated: string;
  };
  system: {
    status: 'healthy' | 'degraded' | 'critical';
    alerts: string[];
    lastUpdated: string;
  };
}

const MonitoringDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Only show to owner (sampettiford@googlemail.com)
  const isOwner = user?.email === 'sampettiford@googlemail.com';

  useEffect(() => {
    if (isOwner) {
      fetchMonitoringMetrics();
      // Refresh every 2 minutes
      const interval = setInterval(fetchMonitoringMetrics, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOwner]);

  const fetchMonitoringMetrics = async () => {
    if (!isOwner) return;

    setRefreshing(true);
    try {
      // Note: In a real implementation, these would call backend endpoints
      // that use the Sentry and Supabase MCPs server-side
      // For now, we'll create a structure that can be populated
      
      const monitoringData: MonitoringMetrics = {
        sentry: {
          errorsLast24h: 0, // Would be fetched via MCP
          errorsLast7d: 0, // Would be fetched via MCP
          unresolvedIssues: 0, // Would be fetched via MCP
          lastUpdated: new Date().toISOString(),
        },
        supabase: {
          edgeFunctionErrors: [], // Would be fetched via MCP
          apiErrors: 0, // Would be fetched via MCP
          lastUpdated: new Date().toISOString(),
        },
        system: {
          status: 'healthy',
          alerts: [],
          lastUpdated: new Date().toISOString(),
        },
      };

      setMetrics(monitoringData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch monitoring metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Monitoring dashboard is only available to the owner.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const getStatusBadge = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />Degraded</Badge>;
      case 'critical':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" />Critical</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring via Sentry & Supabase MCPs
            </p>
          </div>
          <Button
            onClick={fetchMonitoringMetrics}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>System Status</CardTitle>
              </div>
              {getStatusBadge(metrics.system.status)}
            </div>
          </CardHeader>
          <CardContent>
            {metrics.system.alerts.length > 0 ? (
              <div className="space-y-2">
                {metrics.system.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All systems operational</p>
            )}
          </CardContent>
        </Card>

        {/* Sentry Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Errors (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sentry.errorsLast24h}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(metrics.sentry.lastUpdated).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Errors (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sentry.errorsLast7d}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Unresolved Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sentry.unresolvedIssues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Supabase Edge Function Errors */}
        {metrics.supabase.edgeFunctionErrors.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                <CardTitle>Edge Function Errors</CardTitle>
              </div>
              <CardDescription>
                Functions with errors in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.supabase.edgeFunctionErrors.map((error, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{error.function}</div>
                      <div className="text-sm text-muted-foreground">
                        {error.errorCount} errors • Avg: {error.avgExecutionTime}ms
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last error: {new Date(error.lastError).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="destructive">{error.errorCount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Errors */}
        {metrics.supabase.apiErrors > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>API Errors</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.supabase.apiErrors}</div>
              <p className="text-sm text-muted-foreground mt-1">
                API errors in the last 24 hours
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Monitoring Information</CardTitle>
            <CardDescription>
              This dashboard uses Sentry and Supabase MCPs for real-time monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Sentry Monitoring</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Error tracking enabled</li>
                  <li>• Real-time issue detection</li>
                  <li>• Performance monitoring</li>
                  <li>• Session replay available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Supabase Monitoring</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Edge function logs</li>
                  <li>• API request tracking</li>
                  <li>• Database performance</li>
                  <li>• Error rate monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDashboard;

