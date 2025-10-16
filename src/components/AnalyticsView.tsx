import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText, 
  Download,
  Share2,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  overview: {
    totalReports: number;
    activeReports: number;
    avgResponseTime: number;
    riskTrend: 'up' | 'down' | 'stable';
    riskTrendPercent: number;
  };
  trends: {
    reportsByMonth: Array<{ month: string; count: number; trend: number }>;
    categories: Array<{ category: string; count: number; trend: number; riskLevel: number }>;
    responseTimes: Array<{ period: string; avgHours: number; trend: number }>;
  };
  insights: {
    bottlenecks: Array<{ issue: string; impact: string; recommendation: string }>;
    slaBreaches: Array<{ reportId: string; daysOverdue: number; severity: 'high' | 'medium' | 'low' }>;
    patterns: Array<{ pattern: string; frequency: number; riskLevel: 'high' | 'medium' | 'low' }>;
  };
  performance: {
    avgInvestigationTime: number;
    resolutionRate: number;
    escalationRate: number;
    teamEfficiency: Array<{ handler: string; casesHandled: number; avgTime: number; rating: 'excellent' | 'good' | 'needs_improvement' }>;
  };
}

const AnalyticsView: React.FC = () => {
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, organization?.id]);

  const fetchAnalyticsData = async () => {
    if (!organization?.id) return;
    
    setLoading(true);
    try {
      // Fetch reports data
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('organization_id', organization.id)
        .gte('created_at', getDateFilter(selectedPeriod));

      if (reportsError) throw reportsError;

      // Process analytics data
      const processedData = processAnalyticsData(reports || []);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateFilter = (period: string) => {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const processAnalyticsData = (reports: any[]): AnalyticsData => {
    // Calculate overview metrics
    const totalReports = reports.length;
    const activeReports = reports.filter(r => !['closed', 'archived'].includes(r.status)).length;
    
    // Calculate average response time (simplified)
    const avgResponseTime = reports.length > 0 
      ? reports.reduce((acc, r) => acc + (r.updated_at ? new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() : 0), 0) / reports.length / (1000 * 60 * 60 * 24)
      : 0;

    // Calculate risk trend
    const riskTrend = calculateRiskTrend(reports);
    
    // Generate insights
    const insights = generateInsights(reports);
    
    // Calculate performance metrics
    const performance = calculatePerformance(reports);

    return {
      overview: {
        totalReports,
        activeReports,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        riskTrend: riskTrend.direction,
        riskTrendPercent: riskTrend.percent
      },
      trends: {
        reportsByMonth: generateMonthlyTrends(reports),
        categories: generateCategoryTrends(reports),
        responseTimes: generateResponseTimeTrends(reports)
      },
      insights: insights,
      performance: performance
    };
  };

  const calculateRiskTrend = (reports: any[]) => {
    if (reports.length < 2) return { direction: 'stable' as const, percent: 0 };
    
    const recent = reports.slice(0, Math.floor(reports.length / 2));
    const older = reports.slice(Math.floor(reports.length / 2));
    
    const recentAvgRisk = recent.reduce((acc, r) => acc + (r.manual_risk_level || r.priority || 3), 0) / recent.length;
    const olderAvgRisk = older.reduce((acc, r) => acc + (r.manual_risk_level || r.priority || 3), 0) / older.length;
    
    const percentChange = ((recentAvgRisk - olderAvgRisk) / olderAvgRisk) * 100;
    
    if (Math.abs(percentChange) < 5) return { direction: 'stable' as const, percent: Math.abs(percentChange) };
    return { 
      direction: percentChange > 0 ? 'up' as const : 'down' as const, 
      percent: Math.abs(percentChange) 
    };
  };

  const generateInsights = (reports: any[]) => {
    const bottlenecks = [];
    const slaBreaches = [];
    const patterns = [];

    // Identify bottlenecks
    const avgResponseTime = reports.reduce((acc, r) => {
      const responseTime = r.updated_at ? new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() : 0;
      return acc + responseTime;
    }, 0) / reports.length / (1000 * 60 * 60 * 24);

    if (avgResponseTime > 7) {
      bottlenecks.push({
        issue: "Slow Response Times",
        impact: `${Math.round(avgResponseTime)} days average response time`,
        recommendation: "Consider implementing automated triage or additional staff"
      });
    }

    // Identify SLA breaches
    reports.forEach(report => {
      const daysSinceCreated = (new Date().getTime() - new Date(report.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated > 14 && !['closed', 'archived'].includes(report.status)) {
        slaBreaches.push({
          reportId: report.tracking_id,
          daysOverdue: Math.round(daysSinceCreated - 14),
          severity: daysSinceCreated > 30 ? 'high' : daysSinceCreated > 21 ? 'medium' : 'low'
        });
      }
    });

    // Identify patterns
    const categoryCounts = reports.reduce((acc, r) => {
      const category = r.report_type || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count >= 3) {
        patterns.push({
          pattern: `Recurring ${category} issues`,
          frequency: count,
          riskLevel: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low'
        });
      }
    });

    return { bottlenecks, slaBreaches, patterns };
  };

  const calculatePerformance = (reports: any[]) => {
    const avgInvestigationTime = reports.length > 0 
      ? reports.reduce((acc, r) => {
          const investigationTime = r.updated_at ? new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() : 0;
          return acc + investigationTime;
        }, 0) / reports.length / (1000 * 60 * 60 * 24)
      : 0;

    const resolutionRate = reports.length > 0 
      ? (reports.filter(r => r.status === 'closed').length / reports.length) * 100
      : 0;

    const escalationRate = reports.length > 0
      ? (reports.filter(r => r.priority >= 4).length / reports.length) * 100
      : 0;

    return {
      avgInvestigationTime: Math.round(avgInvestigationTime * 10) / 10,
      resolutionRate: Math.round(resolutionRate * 10) / 10,
      escalationRate: Math.round(escalationRate * 10) / 10,
      teamEfficiency: [] // Would need handler data
    };
  };

  const generateMonthlyTrends = (reports: any[]) => {
    const monthlyData = reports.reduce((acc, r) => {
      const month = new Date(r.created_at).toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(r);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, reports]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: reports.length,
        trend: 0 // Would calculate trend vs previous month
      }));
  };

  const generateCategoryTrends = (reports: any[]) => {
    const categoryData = reports.reduce((acc, r) => {
      const category = r.report_type || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(r);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(categoryData).map(([category, reports]) => ({
      category,
      count: reports.length,
      trend: 0,
      riskLevel: Math.round(reports.reduce((acc, r) => acc + (r.manual_risk_level || r.priority || 3), 0) / reports.length)
    }));
  };

  const generateResponseTimeTrends = (reports: any[]) => {
    // Simplified - would need more sophisticated time-based analysis
    return [
      { period: 'Last 7 days', avgHours: 24, trend: -10 },
      { period: 'Last 30 days', avgHours: 48, trend: 5 },
      { period: 'Last 90 days', avgHours: 72, trend: -15 }
    ];
  };

  const handleExport = async () => {
    if (!analyticsData) return;
    
    setExporting(true);
    try {
      const csvData = generateCSVData(analyticsData);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disclosurely-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Analytics data has been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const generateCSVData = (data: AnalyticsData) => {
    let csv = 'Metric,Value,Period\n';
    csv += `Total Reports,${data.overview.totalReports},${selectedPeriod}\n`;
    csv += `Active Reports,${data.overview.activeReports},${selectedPeriod}\n`;
    csv += `Average Response Time (days),${data.overview.avgResponseTime},${selectedPeriod}\n`;
    csv += `Risk Trend,${data.overview.riskTrend} (${data.overview.riskTrendPercent}%),${selectedPeriod}\n`;
    csv += `Resolution Rate,${data.performance.resolutionRate}%,${selectedPeriod}\n`;
    csv += `Escalation Rate,${data.performance.escalationRate}%,${selectedPeriod}\n`;
    return csv;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">Loading insights...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">No data available for the selected period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Decision-ready insights for compliance teams
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Period:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                <p className="text-2xl font-bold">{analyticsData.overview.activeReports}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{analyticsData.overview.avgResponseTime}d</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Trend</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.riskTrend === 'up' ? '↗' : 
                     analyticsData.overview.riskTrend === 'down' ? '↘' : '→'}
                  </p>
                  <Badge variant={analyticsData.overview.riskTrend === 'up' ? 'destructive' : 
                                 analyticsData.overview.riskTrend === 'down' ? 'default' : 'secondary'}>
                    {analyticsData.overview.riskTrendPercent}%
                  </Badge>
                </div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights" className="gap-2">
            <Zap className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bottlenecks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Identified Bottlenecks
                </CardTitle>
                <CardDescription>
                  AI-detected workflow issues requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.insights.bottlenecks.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.insights.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{bottleneck.issue}</p>
                        <p className="text-xs text-muted-foreground mt-1">{bottleneck.impact}</p>
                        <p className="text-xs text-blue-600 mt-2">{bottleneck.recommendation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No bottlenecks detected</p>
                )}
              </CardContent>
            </Card>

            {/* Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Risk Patterns
                </CardTitle>
                <CardDescription>
                  Recurring issues and risk indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.insights.patterns.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.insights.patterns.map((pattern, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{pattern.pattern}</p>
                          <Badge variant={pattern.riskLevel === 'high' ? 'destructive' : 
                                         pattern.riskLevel === 'medium' ? 'secondary' : 'outline'}>
                            {pattern.frequency} cases
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No patterns detected</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Report Categories</CardTitle>
                <CardDescription>Distribution by report type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.trends.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.count}</span>
                        <Badge variant="outline" className="text-xs">
                          Risk {category.riskLevel}/5
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>Reports submitted over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.trends.reportsByMonth.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{month.month}</span>
                      <span className="text-sm font-medium">{month.count} reports</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                  <p className="text-3xl font-bold">{analyticsData.performance.resolutionRate}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Escalation Rate</p>
                  <p className="text-3xl font-bold">{analyticsData.performance.escalationRate}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Avg Investigation Time</p>
                  <p className="text-3xl font-bold">{analyticsData.performance.avgInvestigationTime}d</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                SLA Breaches
              </CardTitle>
              <CardDescription>
                Cases exceeding response time thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.insights.slaBreaches.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.insights.slaBreaches.map((breach, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{breach.reportId}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={breach.severity === 'high' ? 'destructive' : 
                                         breach.severity === 'medium' ? 'secondary' : 'outline'}>
                            {breach.daysOverdue} days overdue
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No SLA breaches detected</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsView;
