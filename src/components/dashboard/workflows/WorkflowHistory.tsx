import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertTriangle, ArrowUp, Clock, UserCheck, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { WorkflowLog } from '@/types/workflow';

interface WorkflowHistoryProps {
  reportId?: string; // If provided, show history for specific report only
}

export function WorkflowHistory({ reportId }: WorkflowHistoryProps) {
  // Get current user's organization
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch workflow logs with report details
  const { data: logs, isLoading } = useQuery({
    queryKey: ['workflow-logs', userProfile?.organization_id, reportId],
    queryFn: async () => {
      if (!userProfile?.organization_id) return [];

      let query = supabase
        .from('workflow_logs')
        .select(`
          *,
          report:reports(
            id,
            tracking_id,
            title,
            organization_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Filter by report if specified
      if (reportId) {
        query = query.eq('report_id', reportId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter to organization's reports
      const filteredData = (data as any[]).filter(
        (log) => log.report?.organization_id === userProfile.organization_id
      );

      return filteredData as (WorkflowLog & { report: any })[];
    },
    enabled: !!userProfile?.organization_id,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'auto_assigned':
        return <Bot className="h-5 w-5 text-blue-500" />;
      case 'sla_calculated':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'sla_warning':
      case 'sla_breached':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'escalated':
        return <ArrowUp className="h-5 w-5 text-red-500" />;
      case 'manually_reassigned':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      auto_assigned: 'Auto-Assigned',
      sla_calculated: 'SLA Calculated',
      sla_warning: 'SLA Warning',
      sla_breached: 'SLA Breached',
      escalated: 'Escalated',
      manually_reassigned: 'Manually Reassigned',
      rule_matched: 'Rule Matched',
    };
    return labels[action] || action;
  };

  const getActionDescription = (log: WorkflowLog) => {
    const details = log.details as any;

    switch (log.action) {
      case 'auto_assigned':
        return `Assigned via rule: ${details.rule_name}`;
      case 'sla_calculated':
        return `SLA deadline set to ${new Date(details.deadline).toLocaleString()} (${details.hours}h from creation)`;
      case 'sla_warning':
        return `SLA deadline approaching (${details.hours_remaining}h remaining)`;
      case 'sla_breached':
        return 'SLA deadline has been exceeded';
      case 'escalated':
        return `Escalated: ${details.reason || 'No reason provided'}`;
      case 'manually_reassigned':
        return `Reassigned: ${details.reason || 'No reason provided'}`;
      default:
        return JSON.stringify(details);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading workflow history...</div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {reportId
              ? 'No workflow events for this report yet.'
              : 'No workflow events yet.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Events will appear here when rules are applied and reports are processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!reportId && (
        <div>
          <h2 className="text-2xl font-bold">Workflow History</h2>
          <p className="text-sm text-muted-foreground">
            Recent workflow automation events
          </p>
        </div>
      )}

      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActionIcon(log.action)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">
                      {getActionLabel(log.action)}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs font-mono">
                      {log.report?.tracking_id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {getActionDescription(log)}
                  </p>
                  {!reportId && log.report?.title && (
                    <p className="text-sm font-medium mb-1">
                      Report: {log.report.title}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
