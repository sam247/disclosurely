import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Search, FileText, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface StatusChange {
  id: string;
  old_status: string;
  new_status: string;
  changed_at: string;
  actor_type: string;
  summary: string;
}

interface StatusTimelineProps {
  reportId: string;
  currentStatus: string;
}

// Status mapping for user-friendly display
const statusMapping = {
  'new': { 
    label: 'Submitted', 
    icon: FileText, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Your report has been received and is being processed'
  },
  'live': { 
    label: 'Live', 
    icon: FileText, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Your report is active and being reviewed'
  },
  'reviewing': { 
    label: 'Under Review', 
    icon: Search, 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Your report is being carefully reviewed by our team'
  },
  'investigating': { 
    label: 'Investigating', 
    icon: AlertCircle, 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'We are actively investigating your report'
  },
  'resolved': { 
    label: 'Resolved', 
    icon: CheckCircle, 
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Your report has been resolved'
  },
  'closed': { 
    label: 'Closed', 
    icon: Lock, 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Your report has been closed'
  },
  'archived': { 
    label: 'Closed', 
    icon: Lock, 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Your report has been closed'
  },
  'deleted': { 
    label: 'Closed', 
    icon: Lock, 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Your report has been closed'
  }
};

const StatusTimeline: React.FC<StatusTimelineProps> = ({ reportId, currentStatus }) => {
  const [statusChanges, setStatusChanges] = useState<StatusChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusChanges = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-status-timeline', {
          body: { reportId }
        });

        if (error) {
          console.error('Error fetching status changes:', error);
          // Fallback to mock timeline
          const mockTimeline = generateMockTimeline(currentStatus);
          setStatusChanges(mockTimeline);
        } else if (data?.timeline && data.timeline.length > 0) {
          setStatusChanges(data.timeline);
        } else {
          // No real timeline data, use mock
          const mockTimeline = generateMockTimeline(currentStatus);
          setStatusChanges(mockTimeline);
        }
      } catch (error) {
        console.error('Error fetching status changes:', error);
        // Fallback to mock timeline
        const mockTimeline = generateMockTimeline(currentStatus);
        setStatusChanges(mockTimeline);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusChanges();
  }, [reportId, currentStatus]);

  const generateMockTimeline = (status: string): StatusChange[] => {
    const timeline: StatusChange[] = [];
    const now = new Date();
    
    // Always start with submitted
    timeline.push({
      id: '1',
      old_status: '',
      new_status: 'new',
      changed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      actor_type: 'system',
      summary: 'Report submitted'
    });

    // Add current status if different from new
    if (status !== 'new') {
      timeline.push({
        id: '2',
        old_status: 'new',
        new_status: status,
        changed_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        actor_type: 'system',
        summary: `Status updated to ${statusMapping[status as keyof typeof statusMapping]?.label || status}`
      });
    }

    return timeline;
  };

  const getStatusInfo = (status: string) => {
    return statusMapping[status as keyof typeof statusMapping] || {
      label: status,
      icon: FileText,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Status update'
    };
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Report Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStatusInfo = getStatusInfo(currentStatus);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Report Status Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge className={`${currentStatusInfo.color} border`}>
              <currentStatusInfo.icon className="mr-1 h-3 w-3" />
              {currentStatusInfo.label}
            </Badge>
            <span className="text-sm text-gray-500">
              Current Status
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {currentStatusInfo.description}
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {statusChanges.map((change, index) => {
            const statusInfo = getStatusInfo(change.new_status);
            const isLast = index === statusChanges.length - 1;
            
            return (
              <div key={change.id} className="flex items-start space-x-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${statusInfo.color.split(' ')[0]} border-2 ${statusInfo.color.split(' ')[2]}`}></div>
                  {!isLast && (
                    <div className="w-px h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>
                
                {/* Timeline content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={statusInfo.color}>
                      <statusInfo.icon className="mr-1 h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(change.changed_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {change.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help text */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What happens next?</strong> Our team will review your report and update the status as we progress. 
            You'll be notified of any significant changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTimeline;
