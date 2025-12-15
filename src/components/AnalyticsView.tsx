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
    
    
    
    
    // Wait for organization to finish loading
    if (orgLoading) {
      
      return;
    }
    
    // Only fetch data if we have an organization ID
    if (organization?.id) {
      
      fetchAnalyticsData();
    } else {
      
      setLoading(false);
    }
  }, [selectedPeriod, organization?.id, orgLoading]);

  const fetchAnalyticsData = async () => {
    if (!organization?.id) {
      
      setLoading(false);
      return;
    }
    
    
    setLoading(true);
    
    try {
      // Get date filter for current period
      const currentPeriodStart = getDateFilter(selectedPeriod);
      
      // Get date filter for previous period (for comparison)
      const previousPeriodStart = getPreviousPeriodStart(selectedPeriod);
      const previousPeriodEnd = currentPeriodStart;

      // Query current period reports - include all reports (like normal reports view), just filter by date
      const { data: currentReports, error: currentError } = await supabase
        .from('reports')
        .select('id, title, status, created_at, updated_at, report_type, priority, manual_risk_level')
        .eq('organization_id', organization.id)
        .is('deleted_at', null) // Only exclude deleted reports
        .gte('created_at', currentPeriodStart);

      if (currentError) {
        console.error('Reports query error:', currentError);
        throw currentError;
      }

      // Query previous period reports for comparison - include all reports
      const { data: previousReports } = await supabase
        .from('reports')
        .select('id, title, status, created_at, updated_at, report_type, priority, manual_risk_level')
        .eq('organization_id', organization.id)
        .is('deleted_at', null) // Only exclude deleted reports
        .gte('created_at', previousPeriodStart)
        .lt('created_at', previousPeriodEnd);

      

      // Process data
      const processedData = processSimpleAnalytics(currentReports || []);
      const previousData = previousReports ? processSimpleAnalytics(previousReports) : null;
      
      
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
    const activeReports = reports.filter(r => !['closed', 'resolved', 'archived'].includes(r.status)).length;
    
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
      <div 
        className="flex-1 overflow-hidden flex flex-col min-h-0" 
        style={{ height: 'calc(100vh - 4rem)', overflow: 'hidden', maxHeight: 'calc(100vh - 4rem)' }}
      >
        <div className="flex-1 overflow-hidden flex flex-col min-h-0" style={{ overflow: 'hidden', maxHeight: '100%' }}>
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 px-4 pt-4 pb-0" style={{ overflow: 'hidden', maxHeight: '100%' }}>
            <div className="flex-shrink-0 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold">Analytics</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {orgLoading ? 'Loading organization...' : 'Loading insights...'}
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-4">
                <Card className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData && !loading && !orgLoading) {
    return (
      <div 
        className="flex-1 overflow-hidden flex flex-col min-h-0" 
        style={{ height: 'calc(100vh - 4rem)', overflow: 'hidden', maxHeight: 'calc(100vh - 4rem)' }}
      >
        <div className="flex-1 overflow-hidden flex flex-col min-h-0" style={{ overflow: 'hidden', maxHeight: '100%' }}>
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 px-4 pt-4 pb-0" style={{ overflow: 'hidden', maxHeight: '100%' }}>
            <div className="flex-shrink-0 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold">Analytics</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {!organization?.id ? 'No organization found. Please contact support.' : 'No data available for the selected period.'}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                <Button 
                  onClick={fetchAnalyticsData} 
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Retry
                </Button>
                {organization?.id && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Period:</label>
                    <select 
                      value={selectedPeriod} 
                      onChange={(e) => setSelectedPeriod(e.target.value as any)}
                      className="px-2 py-1 sm:py-1.5 border rounded-md text-xs sm:text-sm bg-background"
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
    <div 
      className="flex-1 overflow-hidden flex flex-col min-h-0" 
      style={{ height: 'calc(100vh - 4rem)', overflow: 'hidden', maxHeight: 'calc(100vh - 4rem)' }}
    >
      {/* Content - Standardized structure matching dashboard */}
      <div 
        className="flex-1 overflow-hidden flex flex-col min-h-0" 
        style={{ overflow: 'hidden', maxHeight: '100%' }}
      >
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 px-4 pt-4 pb-0" style={{ overflow: 'hidden', maxHeight: '100%' }}>
          {/* Title and Subtitle */}
          <div className="flex-shrink-0 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Analytics</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Decision-ready insights for compliance teams
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Period:</label>
                  <select 
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(e.target.value as any)}
                    className="px-2 py-1 sm:py-1.5 border rounded-md text-xs sm:text-sm bg-background flex-1 sm:flex-initial touch-manipulation"
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
                  className="gap-2 w-full sm:w-auto touch-manipulation text-xs sm:text-sm h-7 sm:h-8"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </div>

            {/* Compact Metric Cards - Small inline row */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border text-xs">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold">{analyticsData.totalReports}</span>
                <span className="text-muted-foreground">Total</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border text-xs">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold">{analyticsData.activeReports}</span>
                <span className="text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold">{analyticsData.avgResponseTime.toFixed(1)}d</span>
                <span className="text-muted-foreground">Response</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border text-xs">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold">{analyticsData.resolutionRate.toFixed(1)}%</span>
                <span className="text-muted-foreground">Resolved</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3 sm:space-y-4">
          {/* Main Chart - Full Width on Mobile */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
              <div className="flex flex-col gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base">Reports Received</CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                    {chartPeriod === 'day' ? 'Daily view' : chartPeriod === 'week' ? 'Weekly view' : 'Monthly view'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Button
                    variant={chartPeriod === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartPeriod('day')}
                    className="text-[11px] sm:text-xs flex-1 sm:flex-initial touch-manipulation h-7 sm:h-8 px-2"
                  >
                    Days
                  </Button>
                  <Button
                    variant={chartPeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartPeriod('week')}
                    className="text-[11px] sm:text-xs flex-1 sm:flex-initial touch-manipulation h-7 sm:h-8 px-2"
                  >
                    Weeks
                  </Button>
                  <Button
                    variant={chartPeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartPeriod('month')}
                    className="text-[11px] sm:text-xs flex-1 sm:flex-initial touch-manipulation h-7 sm:h-8 px-2"
                  >
                    Months
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0 flex flex-col" style={{ minHeight: '150px', height: '150px' }}>
              {getChartData() ? (
                <div className="flex-1 min-h-0 -mx-2 sm:mx-0 px-2 sm:px-0">
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
                        padding: 10,
                        titleFont: {
                          size: 11
                        },
                        bodyFont: {
                          size: 10
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: {
                            size: 9
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
                            size: 9
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-[11px] sm:text-xs">
                No trend data available
              </div>
            )}
            </CardContent>
          </Card>

          {/* Charts Grid - Stack on Mobile, Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Category Distribution */}
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm">Category Distribution</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Breakdown by report type</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1 min-h-0 flex flex-col" style={{ minHeight: '150px', height: '150px' }}>
                {getCategoryChartData() ? (
                  <div className="flex-1 min-h-0 -mx-2 sm:mx-0 px-2 sm:px-0">
                  <Doughnut 
                    data={getCategoryChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                          labels: {
                            padding: 6,
                            font: {
                              size: 9
                            },
                            boxWidth: 10
                          }
                        },
                        tooltip: {
                          padding: 10,
                          titleFont: {
                            size: 11
                          },
                          bodyFont: {
                            size: 10
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
                <div className="h-full flex items-center justify-center text-muted-foreground text-[11px] sm:text-xs">
                  No category data available
                </div>
              )}
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm">Status Breakdown</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Cases by status</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1 min-h-0 flex flex-col" style={{ minHeight: '150px', height: '150px' }}>
                {getStatusChartData() ? (
                  <div className="flex-1 min-h-0 -mx-2 sm:mx-0 px-2 sm:px-0">
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
                          padding: 10,
                          titleFont: {
                            size: 11
                          },
                          bodyFont: {
                            size: 10
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            font: {
                              size: 9
                            }
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                            font: {
                              size: 9
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-[11px] sm:text-xs">
                  No status data available
                </div>
              )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Additional Metrics - Stack on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-shrink-0">
            {/* Priority Breakdown */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm">Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3 sm:pb-4">
                <div className="space-y-2">
                {analyticsData.priorityBreakdown
                  .sort((a, b) => b.priority - a.priority)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0 ${
                          item.priority >= 4 ? 'bg-red-500' :
                          item.priority === 3 ? 'bg-orange-500' :
                          item.priority === 2 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="text-xs sm:text-sm truncate">Priority {item.priority}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium ml-2 flex-shrink-0">{item.count}</span>
                    </div>
                  ))}
              </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm">Top Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3 sm:pb-4">
                <div className="space-y-2">
                {analyticsData.categories
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((category, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 py-1">
                      <span className="text-xs sm:text-sm truncate flex-1 min-w-0">{category.category}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium">{category.count}</span>
                        <div className="w-10 sm:w-16 bg-gray-200 rounded-full h-1.5 sm:h-2">
                          <div 
                            className="bg-primary h-1.5 sm:h-2 rounded-full" 
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
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm">Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3 sm:pb-4">
                <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs sm:text-sm">Escalation Rate</span>
                  <Badge variant={analyticsData.escalationRate > 20 ? 'destructive' : 'secondary'} className="text-[10px] sm:text-xs">
                    {analyticsData.escalationRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs sm:text-sm">Resolution Rate</span>
                  <Badge variant={analyticsData.resolutionRate >= 70 ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                    {analyticsData.resolutionRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs sm:text-sm">Response Time</span>
                  <Badge variant={analyticsData.avgResponseTime > 7 ? 'destructive' : 'default'} className="text-[10px] sm:text-xs">
                    {analyticsData.avgResponseTime.toFixed(1)}d
                  </Badge>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;