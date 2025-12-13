import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface CaseCardProps {
  caseId: string;
  trackingId: string;
  title: string;
  status: string;
  priority: number;
  created_at?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'investigating': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'resolved': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return 'bg-red-100 text-red-800 border-red-200';
    case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
    case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
    case 5: return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const CaseCard = ({ caseId, trackingId, title, status, priority, created_at }: CaseCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/dashboard/ai-assistant?caseId=${caseId}`);
  };

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-mono text-primary mb-1">
              {trackingId}
            </CardTitle>
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {title}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(status)} variant="outline">
            {formatStatus(status)}
          </Badge>
          <Badge className={getPriorityColor(priority)} variant="outline">
            Priority {priority}/5
          </Badge>
        </div>
        {created_at && (
          <p className="text-xs text-muted-foreground">
            Created: {new Date(created_at).toLocaleDateString()}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

