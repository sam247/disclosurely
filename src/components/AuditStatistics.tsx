
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ActivityStats {
  totalActions: number;
  uniqueUsers: number;
  reportsCreated: number;
  actionsToday: number;
}

interface ActionBreakdown {
  action: string;
  count: number;
  percentage: number;
}

interface DailyActivity {
  date: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AuditStatistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ActivityStats>({
    totalActions: 0,
    uniqueUsers: 0,
    reportsCreated: 0,
    actionsToday: 0
  });
  const [actionBreakdown, setActionBreakdown] = useState<ActionBreakdown[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
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

      // Fetch audit logs for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Calculate basic stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const actionsToday = auditLogs?.filter(log => 
        new Date(log.created_at) >= today
      ).length || 0;

      const uniqueUsers = new Set(auditLogs?.map(log => log.user_id).filter(Boolean)).size;
      const reportsCreated = auditLogs?.filter(log => log.action === 'created').length || 0;

      setStats({
        totalActions: auditLogs?.length || 0,
        uniqueUsers,
        reportsCreated,
        actionsToday
      });

      // Calculate action breakdown
      const actionCounts: Record<string, number> = {};
      auditLogs?.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      const total = auditLogs?.length || 1;
      const breakdown = Object.entries(actionCounts).map(([action, count]) => ({
        action: action.replace('_', ' '),
        count,
        percentage: Math.round((count / total) * 100)
      }));

      setActionBreakdown(breakdown);

      // Calculate daily activity for the last 7 days
      const last7Days: DailyActivity[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = auditLogs?.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate >= date && logDate < nextDay;
        }).length || 0;

        last7Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count
        });
      }

      setDailyActivity(last7Days);

    } catch (error) {
      console.error('Error fetching audit statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports Created</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reportsCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Activity</p>
                <p className="text-2xl font-bold text-gray-900">{stats.actionsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
            <CardDescription>Number of actions performed each day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Breakdown</CardTitle>
            <CardDescription>Distribution of different action types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={actionBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ action, percentage }) => `${action} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {actionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditStatistics;
