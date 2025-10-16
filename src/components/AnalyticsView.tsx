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
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Calendar,
  Eye,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SimpleAnalyticsData {
  totalReports: number;
  activeReports: number;
  avgResponseTime: number;
  resolutionRate: number;
  escalationRate: number;
  categories: Array<{ category: string; count: number }>;
  recentReports: Array<{ id: string; title: string; status: string; created_at: string }>;
  dailyTrends: Array<{ date: string; count: number; categories: string[] }>;
  weeklyTrends: Array<{ week: string; count: number; categories: string[] }>;
  monthlyTrends: Array<{ month: string; count: number; categories: string[] }>;
  yearlyTrends: Array<{ year: string; count: number; categories: string[] }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  priorityBreakdown: Array<{ priority: number; count: number }>;
}

const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<SimpleAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    console.log('Analytics useEffect - organization:', organization);
    console.log('Analytics useEffect - organization ID:', organization?.id);
    console.log('Analytics useEffect - orgLoading:', orgLoading);
    
    // Wait for organization to finish loading
    if (orgLoading) {
      console.log('Organization still loading...');
      return;
    }
    
    // Only fetch data if we have an organization ID
    if (organization?.id) {
      console.log('Organization ID available, fetching analytics data');
      fetchAnalyticsData();
    } else {
      console.log('No organization ID, setting loading to false');
      setLoading(false);
    }
  }, [selectedPeriod, organization?.id, orgLoading]);

  const fetchAnalyticsData = async () => {
    if (!organization?.id) {
      console.log('No organization ID available');
      setLoading(false);
      return;
    }
    
    console.log('Fetching analytics data for organization:', organization.id);
    setLoading(true);
    
    try {
      // Query all reports (not filtered by date for total count)
      const queryPromise = supabase
        .from('reports')
        .select('id, title, status, created_at, updated_at, report_type, priority, manual_risk_level')
        .eq('organization_id', organization.id)
        .not('status', 'in', '(archived,closed,deleted)')
        .is('deleted_at', null);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );

      const { data: reports, error: reportsError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      if (reportsError) {
        console.error('Reports query error:', reportsError);
        throw reportsError;
      }

      console.log('Fetched reports:', reports?.length || 0);

      // Simple processing
      const processedData = processSimpleAnalytics(reports || []);
      console.log('Processed analytics data:', processedData);
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

  const generateDailyTrends = (reports: any[]) => {
    const trends: Record<string, { count: number; categories: string[] }> = {};
    
    reports.forEach(report => {
      const date = new Date(report.created_at).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { count: 0, categories: [] };
      }
      trends[date].count++;
      if (report.report_type && !trends[date].categories.includes(report.report_type)) {
        trends[date].categories.push(report.report_type);
      }
    });

    return Object.entries(trends)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const generateWeeklyTrends = (reports: any[]) => {
    const trends: Record<string, { count: number; categories: string[] }> = {};
    
    reports.forEach(report => {
      const date = new Date(report.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!trends[weekKey]) {
        trends[weekKey] = { count: 0, categories: [] };
      }
      trends[weekKey].count++;
      if (report.report_type && !trends[weekKey].categories.includes(report.report_type)) {
        trends[weekKey].categories.push(report.report_type);
      }
    });

    return Object.entries(trends)
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week));
  };

  const generateMonthlyTrends = (reports: any[]) => {
    const trends: Record<string, { count: number; categories: string[] }> = {};
    
    reports.forEach(report => {
      const date = new Date(report.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trends[monthKey]) {
        trends[monthKey] = { count: 0, categories: [] };
      }
      trends[monthKey].count++;
      if (report.report_type && !trends[monthKey].categories.includes(report.report_type)) {
        trends[monthKey].categories.push(report.report_type);
      }
    });

    return Object.entries(trends)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const generateYearlyTrends = (reports: any[]) => {
    const trends: Record<string, { count: number; categories: string[] }> = {};
    
    reports.forEach(report => {
      const year = new Date(report.created_at).getFullYear().toString();
      
      if (!trends[year]) {
        trends[year] = { count: 0, categories: [] };
      }
      trends[year].count++;
      if (report.report_type && !trends[year].categories.includes(report.report_type)) {
        trends[year].categories.push(report.report_type);
      }
    });

    return Object.entries(trends)
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => a.year.localeCompare(b.year));
  };

  const processSimpleAnalytics = (reports: any[]): SimpleAnalyticsData => {
    const totalReports = reports.length;
    const activeReports = reports.filter(r => !['closed', 'archived'].includes(r.status)).length;
    
    // Calculate average response time
    let avgResponseTime = 0;
    if (reports.length > 0) {
      const totalResponseTime = reports.reduce((acc, r) => {
        if (r.updated_at && r.created_at) {
          return acc + (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime());
        }
        return acc;
      }, 0);
      avgResponseTime = totalResponseTime / reports.length / (1000 * 60 * 60 * 24);
    }

    // Calculate resolution rate
    const resolutionRate = totalReports > 0 ? (reports.filter(r => r.status === 'closed').length / totalReports) * 100 : 0;

    // Calculate escalation rate
    const escalationRate = totalReports > 0 ? (reports.filter(r => (r.priority || 0) >= 4).length / totalReports) * 100 : 0;

    // Get categories
    const categoryCounts = reports.reduce((acc, r) => {
      const category = r.report_type || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));

    // Get recent reports
    const recentReports = reports
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        title: r.title || 'Untitled Report',
        status: r.status,
        created_at: r.created_at
      }));

    // Generate trend data
    const dailyTrends = generateDailyTrends(reports);
    const weeklyTrends = generateWeeklyTrends(reports);
    const monthlyTrends = generateMonthlyTrends(reports);
    const yearlyTrends = generateYearlyTrends(reports);

    // Status breakdown
    const statusCounts = reports.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    // Priority breakdown
    const priorityCounts = reports.reduce((acc, r) => {
      const priority = r.priority || 1;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const priorityBreakdown = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: parseInt(priority),
      count
    }));

    return {
      totalReports,
      activeReports,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      resolutionRate: Math.round(resolutionRate * 10) / 10,
      escalationRate: Math.round(escalationRate * 10) / 10,
      categories,
      recentReports,
      dailyTrends,
      weeklyTrends,
      monthlyTrends,
      yearlyTrends,
      statusBreakdown,
      priorityBreakdown
    };
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

  const generateCSVData = (data: SimpleAnalyticsData) => {
    let csv = 'Metric,Value,Period\n';
    csv += `Total Reports,${data.totalReports},${selectedPeriod}\n`;
    csv += `Active Reports,${data.activeReports},${selectedPeriod}\n`;
    csv += `Average Response Time (days),${data.avgResponseTime},${selectedPeriod}\n`;
    csv += `Resolution Rate,${data.resolutionRate}%,${selectedPeriod}\n`;
    csv += `Escalation Rate,${data.escalationRate}%,${selectedPeriod}\n`;
    return csv;
  };

  const getChartData = () => {
    if (!analyticsData) return null;

    let trends, labels, data;
    
    switch (chartPeriod) {
      case 'week':
        trends = analyticsData.weeklyTrends;
        labels = trends.map(t => new Date(t.week).toLocaleDateString());
        data = trends.map(t => t.count);
        break;
      case 'month':
        trends = analyticsData.monthlyTrends;
        labels = trends.map(t => {
          const [year, month] = t.month.split('-');
          return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        data = trends.map(t => t.count);
        break;
      case 'year':
        trends = analyticsData.yearlyTrends;
        labels = trends.map(t => t.year);
        data = trends.map(t => t.count);
        break;
      default:
        trends = analyticsData.dailyTrends.slice(-30); // Last 30 days
        labels = trends.map(t => new Date(t.date).toLocaleDateString());
        data = trends.map(t => t.count);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Reports Submitted',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  const getCategoryChartData = () => {
    if (!analyticsData) return null;

    return {
      labels: analyticsData.categories.map(c => c.category),
      datasets: [
        {
          data: analyticsData.categories.map(c => c.count),
          backgroundColor: [
            '#FF6384',
            '#36A2EB', 
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9900',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
            '#4BC0C0'
          ],
        },
      ],
    };
  };

  const getStatusChartData = () => {
    if (!analyticsData) return null;

    return {
      labels: analyticsData.statusBreakdown.map(s => s.status),
      datasets: [
        {
          label: 'Count',
          data: analyticsData.statusBreakdown.map(s => s.count),
          backgroundColor: [
            '#4CAF50', // Resolved/Closed - Green
            '#FFC107', // In Progress - Yellow  
            '#F44336', // New/Investigating - Red
            '#2196F3', // Other - Blue
          ],
        },
      ],
    };
  };

  if (loading || orgLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              {orgLoading ? 'Loading organization...' : 'Loading insights...'}
            </p>
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

  if (!analyticsData && !loading && !orgLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            {!organization?.id ? 'No organization found. Please contact support.' : 'No data available for the selected period.'}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Button 
              onClick={fetchAnalyticsData} 
              variant="outline"
            >
              Retry
            </Button>
            {organization?.id && (
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
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

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
                <p className="text-2xl font-bold">{analyticsData.totalReports}</p>
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
                <p className="text-2xl font-bold">{analyticsData.activeReports}</p>
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
                <p className="text-2xl font-bold">{analyticsData.avgResponseTime}d</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold">{analyticsData.resolutionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <PieChart className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Report Trends</h3>
              <p className="text-muted-foreground">Track submission patterns and identify spikes</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">View:</label>
              <select 
                value={chartPeriod} 
                onChange={(e) => setChartPeriod(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Cases Submitted Over Time</CardTitle>
              <CardDescription>
                {chartPeriod === 'week' && 'Weekly submission trends'}
                {chartPeriod === 'month' && 'Monthly submission trends'}  
                {chartPeriod === 'year' && 'Yearly submission trends'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getChartData() ? (
                <Line 
                  data={getChartData()!} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          afterLabel: function(context) {
                            const dataIndex = context.dataIndex;
                            const trends = chartPeriod === 'week' ? analyticsData?.weeklyTrends :
                                         chartPeriod === 'month' ? analyticsData?.monthlyTrends :
                                         analyticsData?.yearlyTrends;
                            if (trends && trends[dataIndex]) {
                              const categories = trends[dataIndex].categories;
                              return categories.length > 0 ? `Categories: ${categories.join(', ')}` : '';
                            }
                            return '';
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resolution Rate</span>
                  <Badge variant="default">{analyticsData.resolutionRate}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Escalation Rate</span>
                  <Badge variant={analyticsData.escalationRate > 20 ? 'destructive' : 'secondary'}>
                    {analyticsData.escalationRate}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Response Time</span>
                  <Badge variant={analyticsData.avgResponseTime > 7 ? 'destructive' : 'default'}>
                    {analyticsData.avgResponseTime} days
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
                <CardDescription>AI-generated insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.avgResponseTime > 7 && (
                    <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">Slow Response Times</p>
                      <p className="text-xs text-orange-600">Consider implementing automated triage</p>
                    </div>
                  )}
                  {analyticsData.escalationRate > 20 && (
                    <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">High Escalation Rate</p>
                      <p className="text-xs text-red-600">Review case prioritization process</p>
                    </div>
                  )}
                  {analyticsData.resolutionRate < 50 && (
                    <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">Low Resolution Rate</p>
                      <p className="text-xs text-yellow-600">Consider additional resources or training</p>
                    </div>
                  )}
                  {analyticsData.avgResponseTime <= 3 && analyticsData.resolutionRate >= 70 && (
                    <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Excellent Performance</p>
                      <p className="text-xs text-green-600">Team is performing well</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Categories</CardTitle>
                <CardDescription>Distribution by report type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(category.count / analyticsData.totalReports) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Visual breakdown of report types</CardDescription>
              </CardHeader>
              <CardContent>
                {getCategoryChartData() ? (
                  <Doughnut 
                    data={getCategoryChartData()!} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = analyticsData?.totalReports || 1;
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Latest activity in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      report.status === 'closed' ? 'default' :
                      report.status === 'investigating' ? 'secondary' :
                      'outline'
                    }>
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsView;