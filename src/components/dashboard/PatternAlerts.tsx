import { AlertTriangle, TrendingUp, Users, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  PatternDetectionResult,
  NamePattern,
  CategorySpike,
  TimeCluster
} from '@/utils/patternDetection';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PatternAlertsProps {
  patterns: PatternDetectionResult;
  onReportClick?: (reportIds: string[]) => void;
  onDismiss?: () => void;
}

const PatternAlerts = ({ patterns, onReportClick, onDismiss }: PatternAlertsProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (patterns.totalPatterns === 0) {
    return null;
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
            <CardTitle className="text-sm sm:text-base font-semibold text-orange-900 truncate">
              Pattern Detection Alert
            </CardTitle>
            {patterns.highSeverityCount > 0 && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs flex-shrink-0">
                {patterns.highSeverityCount} High Priority
              </Badge>
            )}
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-orange-100 flex-shrink-0"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-orange-800 mt-1">
          We've detected {patterns.totalPatterns} suspicious{' '}
          {patterns.totalPatterns === 1 ? 'pattern' : 'patterns'} that may indicate systemic
          issues requiring attention.
        </p>
      </CardHeader>

      <CardContent className="space-y-3 px-3 sm:px-6">
        {/* Repeated Names Section */}
        {patterns.repeatedNames.length > 0 && (
          <Collapsible
            open={expandedSection === 'names'}
            onOpenChange={() => setExpandedSection(expandedSection === 'names' ? null : 'names')}
          >
            <Card className="border">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3 pt-3 px-3 sm:px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">
                        Repeated Names ({patterns.repeatedNames.length})
                      </span>
                    </div>
                    {expandedSection === 'names' ? (
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                    The same individuals are mentioned across multiple reports
                  </p>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2 px-3 sm:px-4">
                  {patterns.repeatedNames.map((pattern: NamePattern, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-white rounded border hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-medium text-xs sm:text-sm truncate">{pattern.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] sm:text-xs ${getSeverityColor(pattern.severity)}`}
                          >
                            {pattern.count} reports
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                          Mentioned in reports: {pattern.reportIds.length} time
                          {pattern.reportIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {onReportClick && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] sm:text-xs h-7 sm:h-8 w-full sm:w-auto"
                          onClick={() => onReportClick(pattern.reportIds)}
                        >
                          View Reports
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Category Spikes Section */}
        {patterns.categorySpikes.length > 0 && (
          <Collapsible
            open={expandedSection === 'spikes'}
            onOpenChange={() => setExpandedSection(expandedSection === 'spikes' ? null : 'spikes')}
          >
            <Card className="border">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3 pt-3 px-3 sm:px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">
                        Category Spikes ({patterns.categorySpikes.length})
                      </span>
                    </div>
                    {expandedSection === 'spikes' ? (
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                    Unusual increase in specific report categories
                  </p>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2 px-3 sm:px-4">
                  {patterns.categorySpikes.map((spike: CategorySpike, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-white rounded border hover:border-orange-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-medium text-xs sm:text-sm truncate">{spike.category}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] sm:text-xs ${getSeverityColor(spike.severity)}`}
                          >
                            +{spike.percentageIncrease}%
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                          {spike.recentCount} reports in last 30 days (up from typical rate)
                        </p>
                      </div>
                      {onReportClick && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] sm:text-xs h-7 sm:h-8 w-full sm:w-auto"
                          onClick={() => onReportClick(spike.reportIds)}
                        >
                          View Reports
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Time Clusters Section */}
        {patterns.timeClusters.length > 0 && (
          <Collapsible
            open={expandedSection === 'clusters'}
            onOpenChange={() =>
              setExpandedSection(expandedSection === 'clusters' ? null : 'clusters')
            }
          >
            <Card className="border">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3 pt-3 px-3 sm:px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm truncate">
                        Time Clusters ({patterns.timeClusters.length})
                      </span>
                    </div>
                    {expandedSection === 'clusters' ? (
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                    Multiple reports submitted in short time periods
                  </p>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2 px-3 sm:px-4">
                  {patterns.timeClusters.map((cluster: TimeCluster, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-white rounded border hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] sm:text-xs ${getSeverityColor(cluster.severity)}`}
                          >
                            {cluster.count} reports
                          </Badge>
                          <span className="text-xs sm:text-sm text-gray-700">
                            {formatDate(cluster.startDate)} - {formatDate(cluster.endDate)}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                          {cluster.count} reports submitted within 7 days
                        </p>
                      </div>
                      {onReportClick && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] sm:text-xs h-7 sm:h-8 w-full sm:w-auto"
                          onClick={() => onReportClick(cluster.reportIds)}
                        >
                          View Reports
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export default PatternAlerts;
