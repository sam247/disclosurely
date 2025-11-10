import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Clock, User, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { WorkflowHistory } from './WorkflowHistory';

interface ReportWorkflowCardProps {
  reportId: string;
  report: {
    assigned_to?: string;
    assigned_at?: string;
    sla_deadline?: string;
  };
}

export function ReportWorkflowCard({ reportId, report }: ReportWorkflowCardProps) {
  // Fetch assigned user details
  const { data: assignedUser } = useQuery({
    queryKey: ['user', report.assigned_to],
    queryFn: async () => {
      if (!report.assigned_to) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', report.assigned_to)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!report.assigned_to,
  });

  // Calculate SLA status
  const getSLAStatus = () => {
    if (!report.sla_deadline) return null;

    const deadline = new Date(report.sla_deadline);
    const now = new Date();
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return {
        status: 'breached',
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'SLA Breached',
        description: `Deadline passed ${formatDistanceToNow(deadline, { addSuffix: true })}`,
      };
    } else if (hoursRemaining < 24) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: 'SLA Warning',
        description: `${Math.floor(hoursRemaining)}h remaining`,
      };
    } else {
      return {
        status: 'on-track',
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'On Track',
        description: `Deadline in ${Math.floor(hoursRemaining)}h`,
      };
    }
  };

  const slaStatus = getSLAStatus();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Workflow Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assignment Status */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">Assigned To</p>
              {assignedUser ? (
                <div>
                  <p className="text-sm">
                    {assignedUser.first_name} {assignedUser.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assignedUser.email}
                  </p>
                  {report.assigned_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned {formatDistanceToNow(new Date(report.assigned_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </div>
          </div>

          {/* SLA Status */}
          {slaStatus && (
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border ${slaStatus.bgColor} ${slaStatus.borderColor}`}
            >
              <slaStatus.icon className={`h-5 w-5 mt-0.5 ${slaStatus.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{slaStatus.label}</p>
                  <Badge
                    variant={
                      slaStatus.status === 'breached'
                        ? 'destructive'
                        : slaStatus.status === 'warning'
                        ? 'secondary'
                        : 'default'
                    }
                    className="text-xs"
                  >
                    {slaStatus.description}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deadline: {new Date(report.sla_deadline).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {!report.assigned_to && !report.sla_deadline && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No workflow automation applied to this report
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow History for this report */}
      <WorkflowHistory reportId={reportId} />
    </div>
  );
}
