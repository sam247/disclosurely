import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle
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
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [exporting, setExporting] = useState(false);
  const [previousPeriodData, setPreviousPeriodData] = useState<SimpleAnalyticsData | null>(null);

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
      // Get date filter for current period
      const currentPeriodStart = getDateFilter(selectedPeriod);
      
      // Get date filter for previous period (for comparison)
      const previousPeriodStart = getPreviousPeriodStart(selectedPeriod);
      const previousPeriodEnd = currentPeriodStart;

      // Query current period reports
      const { data: currentReports, error: currentError } = await supabase
        .from('reports')
        .select('id, title, status, created_at, updated_at, report_type, priority, manual_risk_level')
        .eq('organization_id', organization.id)
        .not('status', 'in', '(archived,closed,deleted)')
        .is('deleted_at', null)
        .gte('created_at', currentPeriodStart);

      if (currentError) {
        console.error('Reports query error:', currentError);
        throw currentError;
      }

      // Query previous period reports for comparison
      const { data: previousReports } = await supabase
        .from('reports')
        .select('id, title, status, created_at, updated_at, report_type, priority, manual_risk_level')
        .eq('organization_id', organization.id)
        .not('status', 'in', '(archived,closed,deleted)')
        .is('deleted_at', null)
        .gte('created_at', previousPeriodStart)
        .lt('created_at', previousPeriodEnd);

      console.log('Fetched reports:', currentReports?.length || 0);

      // Process data
      const processedData = processSimpleAnalytics(currentReports || []);
      const previousData = previousReports ? processSimpleAnalytics(previousReports) : null;
      
      console.log('Processed analytics data:', processedData);
      setAnalyticsData(processedData);
      setPreviousPeriodData(previousData);
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

  const getPreviousPeriodStart = (period: string) => {
    const now = new Date();
    const currentStart = getDateFilter(period);
    const currentStartDate = new Date(currentStart);
    const periodDuration = now.getTime() - currentStartDate.getTime();
    return new Date(currentStartDate.getTime() - periodDuration).toISOString();
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
      count: count as number
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
      count: count as number
    }));

    // Priority breakdown
    const priorityCounts = reports.reduce((acc, r) => {
      const priority = r.priority || 1;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const priorityBreakdown = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: parseInt(priority),
      count: count as number
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
      case 'day':
        trends = analyticsData.dailyTrends.slice(-30); // Last 30 days
        labels = trends.map(t => {
          const date = new Date(t.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        data = trends.map(t => t.count);
        break;
      case 'week':
        trends = analyticsData.weeklyTrends;
        labels = trends.map(t => {
          const date = new Date(t.week);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        data = trends.map(t => t.count);
        break;
      case 'month':
      default:
        trends = analyticsData.monthlyTrends;
        labels = trends.map(t => {
          const [year, month] = t.month.split('-');
          return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        data = trends.map(t => t.count);
        break;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Reports Received',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  // Calculate trend percentage for metrics
  const calculateTrend = (current: number, previous: number | null): { value: number; isPositive: boolean } | null => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
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

  // Calculate trends for metrics
  const totalReportsTrend = useMemo(() => 
    calculateTrend(analyticsData?.totalReports || 0, previousPeriodData?.totalReports || null),
    [analyticsData?.totalReports, previousPeriodData?.totalReports]
  );
  const activeReportsTrend = useMemo(() => 
    calculateTrend(analyticsData?.activeReports || 0, previousPeriodData?.activeReports || null),
    [analyticsData?.activeReports, previousPeriodData?.activeReports]
  );
  const avgResponseTimeTrend = useMemo(() => {
    if (!analyticsData || !previousPeriodData) return null;
    const current = analyticsData.avgResponseTime;
    const previous = previousPeriodData.avgResponseTime;
    if (previous === 0) return null;
    const change = current - previous;
    return {
      value: Math.abs(change),
      isPositive: change <= 0 // Lower response time is better
    };
  }, [analyticsData?.avgResponseTime, previousPeriodData?.avgResponseTime]);
  const resolutionRateTrend = useMemo(() => 
    calculateTrend(analyticsData?.resolutionRate || 0, previousPeriodData?.resolutionRate || null),
    [analyticsData?.resolutionRate, previousPeriodData?.resolutionRate]
  );

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                  {orgLoading ? 'Loading organization...' : 'Loading insights...'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData && !loading && !orgLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                {!organization?.id ? 'No organization found. Please contact support.' : 'No data available for the selected period.'}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
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
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Decision-ready insights for compliance teams
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <label className="text-sm font-medium whitespace-nowrap">Period:</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 sm:py-1.5 border rounded-md text-sm bg-background flex-1 sm:flex-initial touch-manipulation"
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
              className="gap-2 w-full sm:w-auto touch-manipulation"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Reports</p>
                  <p className="text-2xl sm:text-3xl font-bold">{analyticsData.totalReports}</p>
                  {totalReportsTrend && (
                    <div className={`flex items-center gap-1 mt-2 text-xs flex-wrap ${totalReportsTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {totalReportsTrend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{totalReportsTrend.value.toFixed(1)}%</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs">vs previous</span>
                    </div>
                  )}
                </div>
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Active Cases</p>
                  <p className="text-2xl sm:text-3xl font-bold">{analyticsData.activeReports}</p>
                  {activeReportsTrend && (
                    <div className={`flex items-center gap-1 mt-2 text-xs flex-wrap ${activeReportsTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {activeReportsTrend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{activeReportsTrend.value.toFixed(1)}%</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs">vs previous</span>
                    </div>
                  )}
                </div>
                <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Avg Response Time</p>
                  <p className="text-2xl sm:text-3xl font-bold">{analyticsData.avgResponseTime.toFixed(1)}d</p>
                  {avgResponseTimeTrend && (
                    <div className={`flex items-center gap-1 mt-2 text-xs flex-wrap ${avgResponseTimeTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {avgResponseTimeTrend.isPositive ? (
                        <ArrowDownRight className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{avgResponseTimeTrend.value.toFixed(1)}d</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs">vs previous</span>
                    </div>
                  )}
                </div>
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Resolution Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold">{analyticsData.resolutionRate.toFixed(1)}%</p>
                  {resolutionRateTrend && (
                    <div className={`flex items-center gap-1 mt-2 text-xs flex-wrap ${resolutionRateTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {resolutionRateTrend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{resolutionRateTrend.value.toFixed(1)}%</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs">vs previous</span>
                    </div>
                  )}
                </div>
                <Target className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">Reports Received</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {chartPeriod === 'day' ? 'Daily view' : chartPeriod === 'week' ? 'Weekly view' : 'Monthly view'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant={chartPeriod === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartPeriod('day')}
                  className="text-xs sm:text-sm flex-1 sm:flex-initial touch-manipulation min-h-[36px] sm:min-h-0"
                >
                  Days
                </Button>
                <Button
                  variant={chartPeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartPeriod('week')}
                  className="text-xs sm:text-sm flex-1 sm:flex-initial touch-manipulation min-h-[36px] sm:min-h-0"
                >
                  Weeks
                </Button>
                <Button
                  variant={chartPeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartPeriod('month')}
                  className="text-xs sm:text-sm flex-1 sm:flex-initial touch-manipulation min-h-[36px] sm:min-h-0"
                >
                  Months
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            {getChartData() ? (
              <div className="h-64 sm:h-80 -mx-2 sm:mx-0 px-2 sm:px-0">
                <Line 
                  data={getChartData()!} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        padding: 12,
                        titleFont: {
                          size: 12
                        },
                        bodyFont: {
                          size: 11
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: {
                            size: 10
                          },
                          maxRotation: 45,
                          minRotation: 45
                        }
                      },
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground text-sm">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Charts and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Category Distribution</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Breakdown by report type</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              {getCategoryChartData() ? (
                <div className="h-56 sm:h-64 -mx-2 sm:mx-0 px-2 sm:px-0">
                  <Doughnut 
                    data={getCategoryChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                          labels: {
                            padding: 8,
                            font: {
                              size: 10
                            },
                            boxWidth: 12
                          }
                        },
                        tooltip: {
                          padding: 12,
                          titleFont: {
                            size: 12
                          },
                          bodyFont: {
                            size: 11
                          },
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
                </div>
              ) : (
                <div className="h-56 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Status Breakdown</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Cases by status</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              {getStatusChartData() ? (
                <div className="h-56 sm:h-64 -mx-2 sm:mx-0 px-2 sm:px-0">
                  <Bar 
                    data={getStatusChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          padding: 12,
                          titleFont: {
                            size: 12
                          },
                          bodyFont: {
                            size: 11
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            font: {
                              size: 10
                            }
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                            font: {
                              size: 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-56 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
                  No status data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Priority Breakdown */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-3">
                {analyticsData.priorityBreakdown
                  .sort((a, b) => b.priority - a.priority)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                          item.priority >= 4 ? 'bg-red-500' :
                          item.priority === 3 ? 'bg-orange-500' :
                          item.priority === 2 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="text-sm truncate">Priority {item.priority}</span>
                      </div>
                      <span className="text-sm font-medium ml-2 flex-shrink-0">{item.count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-3">
                {analyticsData.categories
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((category, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 py-1">
                      <span className="text-sm truncate flex-1 min-w-0">{category.category}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-medium">{category.count}</span>
                        <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
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

          {/* Performance Indicators */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm">Escalation Rate</span>
                  <Badge variant={analyticsData.escalationRate > 20 ? 'destructive' : 'secondary'} className="text-xs sm:text-sm">
                    {analyticsData.escalationRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm">Resolution Rate</span>
                  <Badge variant={analyticsData.resolutionRate >= 70 ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                    {analyticsData.resolutionRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm">Response Time</span>
                  <Badge variant={analyticsData.avgResponseTime > 7 ? 'destructive' : 'default'} className="text-xs sm:text-sm">
                    {analyticsData.avgResponseTime.toFixed(1)} days
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;