import { AlertTriangle, Clock, UserX, Zap, TrendingUp, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface SmartFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  count?: number;
  active: boolean;
}

interface SmartFiltersProps {
  filters: SmartFilter[];
  onFilterToggle: (filterId: string) => void;
  onClearAll: () => void;
}

const SmartFilters = ({ filters, onFilterToggle, onClearAll }: SmartFiltersProps) => {
  const activeCount = filters.filter(f => f.active).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Smart Filters</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeCount} active
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs text-gray-600 hover:text-gray-900"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterToggle(filter.id)}
            className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
              filter.active
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:bg-primary/5'
            }`}
            title={filter.description}
          >
            <span className={filter.active ? 'text-primary-foreground' : 'text-gray-600'}>
              {filter.icon}
            </span>
            <span className="text-sm font-medium">{filter.label}</span>
            {filter.count !== undefined && filter.count > 0 && (
              <Badge
                variant={filter.active ? 'secondary' : 'outline'}
                className={`text-xs ${
                  filter.active ? 'bg-primary-foreground/20 text-primary-foreground' : ''
                }`}
              >
                {filter.count}
              </Badge>
            )}

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {filter.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </div>
          </button>
        ))}
      </div>

      {activeCount === 0 && (
        <p className="text-xs text-gray-500 italic">
          Quick filters help you focus on specific reports. Click a filter to activate it.
        </p>
      )}
    </div>
  );
};

export default SmartFilters;

// Pre-configured filter definitions
export const createSmartFilters = (reports: any[]): SmartFilter[] => {
  const highRiskCount = reports.filter(
    (r) => r.ai_risk_level === 'Critical' || r.ai_risk_level === 'High' || r.manual_risk_level === 1 || r.manual_risk_level === 2
  ).length;

  const unassignedCount = reports.filter((r) => !r.assigned_to).length;

  const recentCount = reports.filter((r) => {
    const daysDiff = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }).length;

  const aiTriagedCount = reports.filter((r) => r.ai_risk_score && r.ai_risk_score > 0).length;

  const needsActionCount = reports.filter((r) => r.status === 'new' || r.status === 'reviewing').length;

  return [
    {
      id: 'high-risk',
      label: 'High Risk',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Critical and high-risk reports requiring immediate attention',
      count: highRiskCount,
      active: false,
    },
    {
      id: 'unassigned',
      label: 'Unassigned',
      icon: <UserX className="h-4 w-4" />,
      description: 'Reports that haven\'t been assigned to a team member',
      count: unassignedCount,
      active: false,
    },
    {
      id: 'recent',
      label: 'Recent (7d)',
      icon: <Clock className="h-4 w-4" />,
      description: 'Reports submitted in the last 7 days',
      count: recentCount,
      active: false,
    },
    {
      id: 'ai-triaged',
      label: 'AI Triaged',
      icon: <Zap className="h-4 w-4" />,
      description: 'Reports with AI risk assessment',
      count: aiTriagedCount,
      active: false,
    },
    {
      id: 'needs-action',
      label: 'Needs Action',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'New or in-review reports requiring attention',
      count: needsActionCount,
      active: false,
    },
  ];
};
