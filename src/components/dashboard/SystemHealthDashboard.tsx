import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Server, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Bot,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import MonitoringDashboard from './MonitoringDashboard';

interface SystemHealthMetrics {
  database: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    activeConnections: number;
  };
  edgeFunctions: {
    status: 'healthy' | 'degraded' | 'down';
    totalFunctions: number;
    activeFunctions: number;
  };
  subscriptions: {
    active: number;
    expired: number;
    pastDue: number;
    trialing: number;
  };
  reports: {
    total: number;
    active: number;
    archived: number;
    today: number;
  };
  organizations: {
    total: number;
    active: number;
  };
  aiUsage: {
    totalRequests: number;
    totalTokens: number;
    todayRequests: number;
    todayTokens: number;
    avgLatency: number;
    piiDetected: number;
  };
  emailUsage: {
    totalSent: number;
    totalFailed: number;
    todaySent: number;
    todayFailed: number;
    pending: number;
  };
  lastUpdated: string;
}

const SystemHealthDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Only show to owner (sampettiford@googlemail.com)
  const isOwner = user?.email === 'sampettiford@googlemail.com';

  useEffect(() => {
    if (isOwner) {
      fetchHealthMetrics();
      // Refresh every 5 minutes
      const interval = setInterval(fetchHealthMetrics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOwner]);

  const fetchHealthMetrics = async () => {
    if (!isOwner) return;

    setRefreshing(true);
    try {
      // Database health check
      const dbStartTime = Date.now();
      const { error: dbError } = await supabase.from('organizations').select('id').limit(1);
      const dbResponseTime = Date.now() - dbStartTime;
      
      // Fetch subscription metrics
      const { data: subscriptions, error: subError } = await supabase
        .from('subscribers')
        .select('subscription_status')
        .eq('subscribed', true);

      // Fetch report metrics
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('status, created_at')
        .is('deleted_at', null);

      // Fetch organization metrics
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, created_at');

      // Fetch AI usage metrics
      const { data: aiLogs, error: aiLogsError } = await supabase
        .from('ai_gateway_logs')
        .select('total_tokens, latency_ms, pii_detected, created_at');

      // Fetch email usage metrics
      const { data: emailNotifications, error: emailError } = await supabase
        .from('email_notifications')
        .select('status, created_at, sent_at');

      // Count reports by status
      const activeReports = reports?.filter(r => r.status !== 'archived' && r.status !== 'resolved').length || 0;
      const archivedReports = reports?.filter(r => r.status === 'archived').length || 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayReports = reports?.filter(r => new Date(r.created_at) >= today).length || 0;

      // Calculate AI usage metrics
      const aiUsageData = {
        totalRequests: aiLogs?.length || 0,
        totalTokens: aiLogs?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0,
        todayRequests: aiLogs?.filter(log => new Date(log.created_at || '') >= today).length || 0,
        todayTokens: aiLogs?.filter(log => new Date(log.created_at || '') >= today).reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0,
        avgLatency: aiLogs && aiLogs.length > 0 
          ? Math.round(aiLogs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / aiLogs.length)
          : 0,
        piiDetected: aiLogs?.filter(log => log.pii_detected === true).length || 0,
      };

      // Calculate email usage metrics
      const emailUsageData = {
        totalSent: emailNotifications?.filter(e => e.status === 'sent').length || 0,
        totalFailed: emailNotifications?.filter(e => e.status === 'failed').length || 0,
        todaySent: emailNotifications?.filter(e => e.status === 'sent' && new Date(e.sent_at || e.created_at || '') >= today).length || 0,
        todayFailed: emailNotifications?.filter(e => e.status === 'failed' && new Date(e.created_at || '') >= today).length || 0,
        pending: emailNotifications?.filter(e => e.status === 'pending').length || 0,
      };

      // Count subscriptions by status
      const subscriptionCounts = {
        active: subscriptions?.filter(s => s.subscription_status === 'active').length || 0,
        expired: subscriptions?.filter(s => s.subscription_status === 'expired').length || 0,
        pastDue: subscriptions?.filter(s => s.subscription_status === 'past_due').length || 0,
        trialing: subscriptions?.filter(s => s.subscription_status === 'trialing').length || 0,
      };

      const healthMetrics: SystemHealthMetrics = {
        database: {
          status: dbError ? 'down' : dbResponseTime > 1000 ? 'degraded' : 'healthy',
          responseTime: dbResponseTime,
          activeConnections: 0, // Would need Supabase API to get this
        },
        edgeFunctions: {
          status: 'healthy', // Would need to check each function
          totalFunctions: 10, // Approximate count
          activeFunctions: 10,
        },
        subscriptions: subscriptionCounts,
        reports: {
          total: reports?.length || 0,
          active: activeReports,
          archived: archivedReports,
          today: todayReports,
        },
        organizations: {
          total: orgs?.length || 0,
          active: orgs?.filter(o => o.created_at).length || 0,
        },
        aiUsage: aiUsageData,
        emailUsage: emailUsageData,
        lastUpdated: new Date().toISOString(),
      };

      setMetrics(healthMetrics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch system health metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              System health dashboard is only available to the owner.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const getStatusBadge = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500"><AlertCircle className="h-3 w-3 mr-1" />Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" />Down</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 overflow-hidden">
        <Tabs defaultValue="health" className="w-full flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full max-w-md grid-cols-2 flex-shrink-0">
            <TabsTrigger value="health">
              <Activity className="h-4 w-4 mr-2" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <BarChart3 className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="health" className="space-y-6 mt-6 flex-1 min-h-0 overflow-y-auto pr-2">
        {/* Header */}
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Health Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
            </p>
          </div>
          <Button
            onClick={fetchHealthMetrics}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Database Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Database</CardTitle>
                </div>
                {getStatusBadge(metrics.database.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium">{metrics.database.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{metrics.database.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edge Functions Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  <CardTitle>Edge Functions</CardTitle>
                </div>
                {getStatusBadge(metrics.edgeFunctions.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Functions</span>
                  <span className="font-medium">
                    {metrics.edgeFunctions.activeFunctions} / {metrics.edgeFunctions.totalFunctions}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subscriptions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-semibold text-green-600">{metrics.subscriptions.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trialing</span>
                  <span className="font-semibold text-blue-600">{metrics.subscriptions.trialing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Past Due</span>
                  <span className="font-semibold text-yellow-600">{metrics.subscriptions.pastDue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expired</span>
                  <span className="font-semibold text-red-600">{metrics.subscriptions.expired}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-semibold">{metrics.reports.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-semibold">{metrics.reports.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Archived</span>
                  <span className="font-semibold">{metrics.reports.archived}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Today</span>
                  <span className="font-semibold">{metrics.reports.today}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-semibold">{metrics.organizations.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-semibold">{metrics.organizations.active}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reports Today</span>
                  <span className="font-semibold">{metrics.reports.today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Trials</span>
                  <span className="font-semibold">{metrics.subscriptions.trialing}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI & Email Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Usage */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle>AI Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Requests</span>
                  <span className="font-semibold">{metrics.aiUsage.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Tokens</span>
                  <span className="font-semibold">{metrics.aiUsage.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Today Requests</span>
                  <span className="font-semibold text-blue-600">{metrics.aiUsage.todayRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Today Tokens</span>
                  <span className="font-semibold text-blue-600">{metrics.aiUsage.todayTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Latency</span>
                  <span className="font-semibold">{metrics.aiUsage.avgLatency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">PII Detected</span>
                  <span className="font-semibold text-orange-600">{metrics.aiUsage.piiDetected}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Usage */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Email Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Sent</span>
                  <span className="font-semibold text-green-600">{metrics.emailUsage.totalSent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Failed</span>
                  <span className="font-semibold text-red-600">{metrics.emailUsage.totalFailed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Today Sent</span>
                  <span className="font-semibold text-blue-600">{metrics.emailUsage.todaySent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Today Failed</span>
                  <span className="font-semibold text-red-600">{metrics.emailUsage.todayFailed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-yellow-600">{metrics.emailUsage.pending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">
                    {metrics.emailUsage.totalSent + metrics.emailUsage.totalFailed > 0
                      ? Math.round((metrics.emailUsage.totalSent / (metrics.emailUsage.totalSent + metrics.emailUsage.totalFailed)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          </TabsContent>
          
          <TabsContent value="monitoring" className="mt-6 flex-1 min-h-0 overflow-y-auto pr-2">
            <MonitoringDashboard />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;

