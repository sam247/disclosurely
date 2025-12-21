
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, FileText, Clock, BarChart3 } from 'lucide-react';
import { log, LogContext } from '@/utils/logger';

interface ReportStats {
  totalReports: number;
  reportsByCategory: Array<{ category: string; count: number }>;
  averageResponseTime: number;
  monthlyGrowth: number;
}

const ReportsStatistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    reportsByCategory: [],
    averageResponseTime: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReportStatistics();
    }
  }, [user]);

  const fetchReportStatistics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      const orgId = profile.organization_id;

      // Get total reports count
      const { count: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      // Get reports by category (using tags as categories)
      const { data: reportData } = await supabase
        .from('reports')
        .select('tags, report_type')
        .eq('organization_id', orgId);

      // Process categories from tags and report_type
      const categoryMap = new Map();
      reportData?.forEach(report => {
        if (report.tags && report.tags.length > 0) {
          report.tags.forEach((tag: string) => {
            categoryMap.set(tag, (categoryMap.get(tag) || 0) + 1);
          });
        } else {
          // Use report_type as fallback category
          const type = report.report_type || 'General';
          categoryMap.set(type, (categoryMap.get(type) || 0) + 1);
        }
      });

      const reportsByCategory = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 categories

      // Calculate average response time (days between created_at and resolved_at)
      const { data: resolvedReports } = await supabase
        .from('reports')
        .select('created_at, resolved_at')
        .eq('organization_id', orgId)
        .not('resolved_at', 'is', null);

      let averageResponseTime = 0;
      if (resolvedReports && resolvedReports.length > 0) {
        const totalDays = resolvedReports.reduce((sum, report) => {
          const created = new Date(report.created_at);
          const resolved = new Date(report.resolved_at!);
          const diffDays = Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        averageResponseTime = Math.round(totalDays / resolvedReports.length);
      }

      // Calculate monthly growth
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const lastMonth = new Date(currentMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { count: currentMonthReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('created_at', currentMonth.toISOString());

      const { count: lastMonthReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString());

      const monthlyGrowth = lastMonthReports > 0 
        ? Math.round(((currentMonthReports || 0) - (lastMonthReports || 0)) / (lastMonthReports || 1) * 100)
        : 0;

      setStats({
        totalReports: totalReports || 0,
        reportsByCategory,
        averageResponseTime,
        monthlyGrowth
      });

    } catch (error) {
      log.error(LogContext.FRONTEND, 'Error fetching report statistics', error instanceof Error ? error : new Error(String(error)), { userId: user?.id });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                  {stats.monthlyGrowth !== 0 && (
                    <span className={`flex items-center text-sm ${
                      stats.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageResponseTime > 0 ? `${stats.averageResponseTime}d` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.reportsByCategory.length > 0 ? stats.reportsByCategory[0].category : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Reports by Category</CardTitle>
          <CardDescription>Breakdown of reports by category or type</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.reportsByCategory.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No category data available</p>
              <p className="text-sm text-gray-500">Categories will appear as reports are submitted</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.reportsByCategory.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-600' :
                      index === 1 ? 'bg-green-600' :
                      index === 2 ? 'bg-yellow-600' :
                      index === 3 ? 'bg-purple-600' :
                      'bg-gray-600'
                    }`}></div>
                    <span className="font-medium capitalize">{category.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`flex-1 h-2 rounded-full bg-gray-200 w-24 ${
                      index === 0 ? 'bg-blue-200' :
                      index === 1 ? 'bg-green-200' :
                      index === 2 ? 'bg-yellow-200' :
                      index === 3 ? 'bg-purple-200' :
                      'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-600' :
                          index === 1 ? 'bg-green-600' :
                          index === 2 ? 'bg-yellow-600' :
                          index === 3 ? 'bg-purple-600' :
                          'bg-gray-600'
                        }`}
                        style={{ 
                          width: `${Math.max(10, (category.count / stats.totalReports) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900 w-8 text-right">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsStatistics;
