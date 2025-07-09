import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UsageStats {
  totalReports: number;
  activeUsers: number;
  storageUsed: number; // in bytes
  reportsThisMonth: number;
}

export const useUsageStats = () => {
  const [stats, setStats] = useState<UsageStats>({
    totalReports: 0,
    activeUsers: 0,
    storageUsed: 0,
    reportsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUsageStats();
    }
  }, [user]);

  const fetchUsageStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's organization ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const organizationId = profile.organization_id;

      // Fetch total reports
      const { count: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Fetch reports this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: reportsThisMonth } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', startOfMonth.toISOString());

      // Fetch active users
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      // Fetch storage usage (sum of all attachment file sizes)
      const { data: attachments } = await supabase
        .from('report_attachments')
        .select('file_size, reports!inner(organization_id)')
        .eq('reports.organization_id', organizationId);

      const storageUsed = attachments?.reduce((total, attachment) => {
        return total + (attachment.file_size || 0);
      }, 0) || 0;

      setStats({
        totalReports: totalReports || 0,
        activeUsers: activeUsers || 0,
        storageUsed,
        reportsThisMonth: reportsThisMonth || 0
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    stats,
    loading,
    refetch: fetchUsageStats,
    formatStorage
  };
};