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
import { decryptReport } from '@/utils/encryption';
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
  Filler,
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
  ArcElement,
  Filler
);

interface SimpleAnalyticsData {
  totalReports: number;
  activeReports: number;
  avgResponseTime: number;
  resolutionRate: number;
  escalationRate: number;
  categories: Array<{ category: string; count: number }>;
  mainCategories: Array<{ category: string; count: number }>;
  subCategories: Array<{ category: string; count: number }>;
  recentReports: Array<{ id: string; title: string; status: string; created_at: string }>;
  dailyTrends: Array<{ date: string; count: number; categories: string[] }>;
  weeklyTrends: Array<{ week: string; count: number; categories: string[] }>;
  monthlyTrends: Array<{ month: string; count: number; categories: string[] }>;
  yearlyTrends: Array<{ year: string; count: number; categories: string[] }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  responseTimeByCategory: Array<{ category: string; avgDays: number; count: number }>;
  resolutionRateByCategory: Array<{ category: string; rate: number; total: number; resolved: number }>;
  recentActivity: Array<{ date: string; count: number; label: string }>;
}

const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<SimpleAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('90d'); // Default to 90d to include November reports
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [exporting, setExporting] = useState(false);
  const [previousPeriodData, setPreviousPeriodData] = useState<SimpleAnalyticsData | null>(null);

  useEffect(() => {
    // Wait for organization to finish loading
    if (orgLoading) {
      console.log('[Analytics] Waiting for organization to load...');
      return;
    }
    
    // Only fetch data if we have an organization ID
    if (organization?.id) {
      console.log('[Analytics] Organization loaded, fetching analytics data for period:', selectedPeriod);
      fetchAnalyticsData();
    } else {
      console.warn('[Analytics] No organization ID available');
      setLoading(false);
    }
  }, [selectedPeriod, organization?.id, orgLoading]);

  const fetchAnalyticsData = async () => {
    if (!organization?.id) {
      console.warn('[Analytics] fetchAnalyticsData called without organization ID');
      setLoading(false);
      return;
    }
    
    console.log('[Analytics] Starting fetchAnalyticsData for organization:', organization.id, 'period:', selectedPeriod);
    setLoading(true);
    
    try {
      // Get date filter for current period
      const currentPeriodStart = getDateFilter(selectedPeriod);
      
      // Get date filter for previous period (for comparison)
      const previousPeriodStart = getPreviousPeriodStart(selectedPeriod);
      const previousPeriodEnd = currentPeriodStart;

      // Query current period reports - include encrypted_content for category decryption
      let currentReportsQuery = supabase
        .from('reports')
        .select('id, title, status, created_at, updated_at, report_type, priority, manual_risk_level, encrypted_content')
        .eq('organization_id', organization.id)
        .is('deleted_at', null) // Only exclude deleted reports
        .gte('created_at', currentPeriodStart);

      // For 1y period, also filter to end of 2025
      if (selectedPeriod === '1y') {
        currentReportsQuery = currentReportsQuery.lte('created_at', new Date('2025-12-31T23:59:59Z').toISOString());
      }

      const { data: currentReports, error: currentError } = await currentReportsQuery;

      if (currentError) {
        console.error('Reports query error:', currentError);
        throw currentError;
      }

      console.log('Analytics: Fetched reports count:', currentReports?.length || 0, 'for period:', selectedPeriod, 'from:', currentPeriodStart);

      // Query previous period reports for comparison - include all reports
      const { data: previousReports } = await supabase
        .from('reports')
        .select('id, title, status, created_at, updated_at, report_type, priority, manual_risk_level, encrypted_content')
        .eq('organization_id', organization.id)
        .is('deleted_at', null) // Only exclude deleted reports
        .gte('created_at', previousPeriodStart)
        .lt('created_at', previousPeriodEnd);

      

      // Decrypt categories for current period reports (optional - don't fail if decryption fails)
      let reportsWithCategories = currentReports || [];
      try {
        reportsWithCategories = await decryptCategoriesForReports(currentReports || [], organization.id);
      } catch (decryptError) {
        console.warn('Category decryption failed, continuing without categories:', decryptError);
        // Continue with reports without decrypted categories
        reportsWithCategories = (currentReports || []).map(r => ({
          ...r,
          mainCategory: null,
          subCategory: null
        }));
      }
      
      // Process data - pass selectedPeriod for monthly trends generation
      console.log('Analytics: Processing', reportsWithCategories.length, 'reports');
      const processedData = processSimpleAnalytics(reportsWithCategories, selectedPeriod);
      console.log('Analytics: Processed data:', {
        totalReports: processedData.totalReports,
        mainCategories: processedData.mainCategories.length,
        subCategories: processedData.subCategories.length,
        statusBreakdown: processedData.statusBreakdown.length
      });
      
      // Process previous period data (without decryption for now to speed things up)
      const previousData = previousReports ? processSimpleAnalytics(
        previousReports.map(r => ({ ...r, mainCategory: null, subCategory: null })),
        selectedPeriod
      ) : null;
      
      
      setAnalyticsData(processedData);
      setPreviousPeriodData(previousData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty analytics data so the page still renders
      setAnalyticsData({
        totalReports: 0,
        activeReports: 0,
        avgResponseTime: 0,
        resolutionRate: 0,
        escalationRate: 0,
        categories: [],
        mainCategories: [],
        subCategories: [],
        recentReports: [],
        dailyTrends: [],
        weeklyTrends: [],
        monthlyTrends: [],
        yearlyTrends: [],
        statusBreakdown: [],
        priorityBreakdown: []
      });
      toast({
        title: "Analytics Error",
        description: error instanceof Error ? error.message : "Failed to load analytics data. Please try again.",
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
        // For 1y, show full 2025 year (Jan 1, 2025 to Dec 31, 2025)
        return new Date('2025-01-01T00:00:00Z').toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  // Helper function to decrypt categories for reports
  const decryptCategoriesForReports = async (reports: any[], organizationId: string) => {
    // If no reports, return empty array
    if (!reports || reports.length === 0) {
      return [];
    }
    
    // Limit decryption to avoid timeout issues - decrypt in batches
    // Also limit total number of reports to decrypt to prevent performance issues
    const maxReportsToDecrypt = 100;
    const reportsToProcess = reports.slice(0, maxReportsToDecrypt);
    const batchSize = 10;
    const reportsWithCategories = [];
    
    for (let i = 0; i < reportsToProcess.length; i += batchSize) {
      const batch = reportsToProcess.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (report) => {
          if (report.encrypted_content) {
            try {
              const decrypted = await decryptReport(report.encrypted_content, organizationId);
              if (decrypted && decrypted.category) {
                const parts = decrypted.category.split(' - ');
                return {
                  ...report,
                  mainCategory: parts[0] || decrypted.category,
                  subCategory: parts[1] || ''
                };
              }
            } catch (error) {
              console.warn('Failed to decrypt category for report:', report.id, error);
            }
          }
          return {
            ...report,
            mainCategory: null,
            subCategory: null
          };
        })
      );
      
      // Extract results from Promise.allSettled
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          reportsWithCategories.push(result.value);
        } else {
          // If decryption failed, add report without categories
          reportsWithCategories.push({
            ...batch[index],
            mainCategory: null,
            subCategory: null
          });
        }
      });
    }
    
    // Add remaining reports without decryption if we hit the limit
    if (reports.length > maxReportsToDecrypt) {
      const remainingReports = reports.slice(maxReportsToDecrypt).map(r => ({
        ...r,
        mainCategory: null,
        subCategory: null
      }));
      reportsWithCategories.push(...remainingReports);
    }
    
    return reportsWithCategories;
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

  const generateMonthlyTrends = (reports: any[], period: string = '30d') => {
    const trends: Record<string, { count: number; categories: string[] }> = {};
    
    // For 1y period, ensure we have all 12 months of 2025
    if (period === '1y') {
      for (let month = 1; month <= 12; month++) {
        const monthKey = `2025-${String(month).padStart(2, '0')}`;
        trends[monthKey] = { count: 0, categories: [] };
      }
    }
    
    reports.forEach(report => {
      const date = new Date(report.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Only include 2025 months for 1y period
      if (period === '1y' && date.getFullYear() !== 2025) {
        return;
      }
      
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

  const processSimpleAnalytics = (reports: any[], period: string = '90d'): SimpleAnalyticsData => {
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

    // Get categories (legacy report_type)
    const categoryCounts = reports.reduce((acc, r) => {
      const category = r.report_type || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count: count as number
    }));

    // Get main categories (Financial Misconduct, Workplace Behaviour, etc.)
    const mainCategoryCounts = reports.reduce((acc, r) => {
      const mainCategory = r.mainCategory || 'Uncategorized';
      acc[mainCategory] = (acc[mainCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mainCategories = Object.entries(mainCategoryCounts)
      .map(([category, count]) => ({
        category,
        count: count as number
      }))
      .sort((a, b) => b.count - a.count);

    // Get sub categories (Fraud, Harassment, etc.)
    const subCategoryCounts = reports.reduce((acc, r) => {
      if (r.subCategory) {
        acc[r.subCategory] = (acc[r.subCategory] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const subCategories = Object.entries(subCategoryCounts)
      .map(([category, count]) => ({
        category,
        count: count as number
      }))
      .sort((a, b) => b.count - a.count);

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
    const monthlyTrends = generateMonthlyTrends(reports, period);
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

    // Response Time by Category
    const responseTimeByCategoryMap = reports.reduce((acc, r) => {
      const category = r.mainCategory || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { totalTime: 0, count: 0 };
      }
      if (r.updated_at && r.created_at) {
        const responseTime = new Date(r.updated_at).getTime() - new Date(r.created_at).getTime();
        acc[category].totalTime += responseTime;
        acc[category].count += 1;
      }
      return acc;
    }, {} as Record<string, { totalTime: number; count: number }>);

    const responseTimeByCategory = Object.entries(responseTimeByCategoryMap)
      .map(([category, data]) => ({
        category,
        avgDays: data.count > 0 ? Math.round((data.totalTime / data.count / (1000 * 60 * 60 * 24)) * 10) / 10 : 0,
        count: data.count
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.avgDays - a.avgDays)
      .slice(0, 5);

    // Resolution Rate by Category
    const resolutionByCategoryMap = reports.reduce((acc, r) => {
      const category = r.mainCategory || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, resolved: 0 };
      }
      acc[category].total += 1;
      if (r.status === 'closed' || r.status === 'resolved') {
        acc[category].resolved += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; resolved: number }>);

    const resolutionRateByCategory = Object.entries(resolutionByCategoryMap)
      .map(([category, data]) => ({
        category,
        rate: data.total > 0 ? Math.round((data.resolved / data.total) * 100 * 10) / 10 : 0,
        total: data.total,
        resolved: data.resolved
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    // Recent Activity (last 7 days)
    const recentActivityMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      recentActivityMap[dateKey] = 0;
    }

    reports.forEach(r => {
      const reportDate = new Date(r.created_at).toISOString().split('T')[0];
      if (recentActivityMap.hasOwnProperty(reportDate)) {
        recentActivityMap[reportDate] += 1;
      }
    });

    const recentActivity = Object.entries(recentActivityMap)
      .map(([date, count]) => {
        const d = new Date(date);
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return { date, count, label };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalReports,
      activeReports,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      resolutionRate: Math.round(resolutionRate * 10) / 10,
      escalationRate: Math.round(escalationRate * 10) / 10,
      categories,
      mainCategories,
      subCategories,
      recentReports,
      dailyTrends,
      weeklyTrends,
      monthlyTrends,
      yearlyTrends,
      statusBreakdown,
      responseTimeByCategory,
      resolutionRateByCategory,
      recentActivity
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
    
    // If period is "1y", show monthly trends for 2025 (yearly view)
    // Otherwise use chartPeriod selection
    if (selectedPeriod === '1y') {
      trends = analyticsData.monthlyTrends;
      // Ensure we show all 12 months of 2025
      labels = trends.map(t => {
        const [year, month] = t.month.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
      });
      data = trends.map(t => t.count);
    } else {
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
    if (!analyticsData || analyticsData.mainCategories.length === 0) return null;

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9900', '#FF9F40', '#C9CBCF', '#FF6384', '#4BC0C0'
    ];

    return {
      labels: analyticsData.mainCategories.map(c => c.category),
      datasets: [
        {
          data: analyticsData.mainCategories.map(c => c.count),
          backgroundColor: colors.slice(0, analyticsData.mainCategories.length),
        },
      ],
    };
  };

  const getSubCategoryChartData = () => {
    if (!analyticsData || analyticsData.subCategories.length === 0) return null;

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9900', '#FF9F40', '#C9CBCF', '#FF6384', '#4BC0C0',
      '#FF6B9D', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'
    ];

    // Show top 10 subcategories
    const topSubCategories = analyticsData.subCategories.slice(0, 10);

    return {
      labels: topSubCategories.map(c => c.category),
      datasets: [
        {
          data: topSubCategories.map(c => c.count),
          backgroundColor: colors.slice(0, topSubCategories.length),
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
    <div className="flex flex-col gap-0" style={{ height: 'calc(100vh - 109px)', overflow: 'hidden' }} data-analytics-root>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0 px-2 sm:px-0 mb-2">
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
      <div className="flex flex-wrap gap-2 mb-2 px-2 sm:px-0 flex-shrink-0">
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

      {/* Content Area - No scroll, fits on one screen */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col space-y-3 sm:space-y-4 px-2 sm:px-0" style={{ minHeight: 0, overflowY: 'hidden' }}>
          {/* Main Chart - Full Width on Mobile */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
              <div className="flex flex-col gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base">Reports Received</CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                    {selectedPeriod === '1y' ? 'Yearly view (monthly breakdown)' : chartPeriod === 'day' ? 'Daily view' : chartPeriod === 'week' ? 'Weekly view' : 'Monthly view'}
                  </CardDescription>
                </div>
                {selectedPeriod !== '1y' && (
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
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 flex-1 min-h-0 flex flex-col" style={{ minHeight: '100px', height: '100px' }}>
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
                        padding: 8,
                        titleFont: {
                          size: 10
                        },
                        bodyFont: {
                          size: 9
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: {
                            size: 8
                          },
                          maxRotation: 0,
                          minRotation: 0
                        }
                      },
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          font: {
                            size: 8
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

          {/* Charts Grid - 3 Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* By Category (Main Categories) */}
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm">By Category</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Financial Misconduct, Workplace Behaviour, etc.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 min-h-0 flex flex-col" style={{ minHeight: '120px', height: '120px' }}>
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

            {/* By Sub Category */}
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm">By Sub Category</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Fraud, Harassment, etc.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 min-h-0 flex flex-col" style={{ minHeight: '120px', height: '120px' }}>
                {getSubCategoryChartData() ? (
                  <div className="flex-1 min-h-0 -mx-2 sm:mx-0 px-2 sm:px-0">
                  <Doughnut 
                    data={getSubCategoryChartData()!} 
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
                  No subcategory data available
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
              <CardContent className="pt-0 pb-4 flex-1 min-h-0 flex flex-col" style={{ minHeight: '120px', height: '120px' }}>
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

          {/* Business Analytics - 3 Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Response Time by Category */}
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm">Response Time by Category</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Average days to respond</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 min-h-0">
                <div className="space-y-1.5">
                  {analyticsData.responseTimeByCategory.length > 0 ? (
                    analyticsData.responseTimeByCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-0.5">
                        <span className="text-[10px] sm:text-xs truncate flex-1">{item.category}</span>
                        <span className="text-[10px] sm:text-xs font-medium flex-shrink-0 ml-2">{item.avgDays}d</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-[11px] sm:text-xs">
                      No response time data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resolution Rate by Category */}
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm">Resolution Rate by Category</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Percentage of cases resolved</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 min-h-0">
                <div className="space-y-1.5">
                  {analyticsData.resolutionRateByCategory.length > 0 ? (
                    analyticsData.resolutionRateByCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-0.5">
                        <span className="text-[10px] sm:text-xs truncate flex-1">{item.category}</span>
                        <span className="text-[10px] sm:text-xs font-medium flex-shrink-0 ml-2">{item.rate}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-[11px] sm:text-xs">
                      No resolution data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm">Recent Activity</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Reports submitted (last 7 days)</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 min-h-0">
                <div className="space-y-1.5">
                  {analyticsData.recentActivity.length > 0 ? (
                    analyticsData.recentActivity.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-0.5">
                        <span className="text-[10px] sm:text-xs truncate flex-1">{item.label}</span>
                        <span className="text-[10px] sm:text-xs font-medium flex-shrink-0 ml-2">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-[11px] sm:text-xs">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
};

export default AnalyticsView;