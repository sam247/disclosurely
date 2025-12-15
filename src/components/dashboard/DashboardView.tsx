import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { log, LogContext } from '@/utils/logger';
import { auditLogger } from '@/utils/auditLogger';
import { FileText, Eye, Archive, Trash2, RotateCcw, MoreVertical, XCircle, ChevronUp, ChevronDown, CheckCircle, Search, Download, FileSpreadsheet, Bot, Zap, AlertCircle, Clock, Flame, User, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReportMessaging from '@/components/ReportMessaging';
import ReportContentDisplay from '@/components/ReportContentDisplay';
import ReportAttachments from '@/components/ReportAttachments';
import LinkGenerator from '@/components/LinkGenerator';
import BulkActions from '@/components/dashboard/BulkActions';
import SmartFilters, { createSmartFilters, SmartFilter } from '@/components/dashboard/SmartFilters';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBrandedPDF, addPDFSection, addPDFField, downloadPDF, exportToCSV, formatExportDate, getStatusColor, addPDFTable } from '@/utils/export-utils';
import { decryptReport } from '@/utils/encryption';
import { detectAllPatterns, PatternDetectionResult } from '@/utils/patternDetection';

// Risk Level Selector Component
const RiskLevelSelector = ({ 
  reportId, 
  currentLevel, 
  onUpdate, 
  isUpdating 
}: { 
  reportId: string; 
  currentLevel?: number; 
  onUpdate: (level: number) => void; 
  isUpdating: boolean;
}) => {
  const getRiskLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800 border-red-200'; // Critical - Red
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200'; // High - Orange
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Medium - Yellow
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200'; // Low - Light Blue
      case 5: return 'bg-green-100 text-green-800 border-green-200'; // Informational - Green
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getRiskLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      case 5: return 'Info';
      default: return 'Unknown';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-6 px-2 text-xs ${currentLevel ? getRiskLevelColor(currentLevel) : 'bg-gray-100 text-gray-600'}`}
          disabled={isUpdating}
        >
          {currentLevel ? `${getRiskLevelText(currentLevel)} (${currentLevel}/5)` : 'Set Risk'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 mb-2">Select Risk Level</div>
          {[
            { level: 1, text: 'Critical', desc: 'Serious violation', dotColor: 'bg-red-500' },
            { level: 2, text: 'High', desc: 'Significant impact', dotColor: 'bg-orange-500' },
            { level: 3, text: 'Medium', desc: 'Standard concern', dotColor: 'bg-yellow-500' },
            { level: 4, text: 'Low', desc: 'Minor issue', dotColor: 'bg-blue-500' },
            { level: 5, text: 'Info', desc: 'General feedback', dotColor: 'bg-green-500' }
          ].map(({ level, text, desc, dotColor }) => (
            <Button
              key={level}
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-xs ${currentLevel === level ? 'bg-primary/10' : ''}`}
              onClick={() => onUpdate(level)}
            >
              <div className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${dotColor}`} />
              <div className="text-left">
                <div className="font-medium">{text} ({level}/5)</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: 'new' | 'in_review' | 'reviewing' | 'investigating' | 'resolved' | 'closed' | 'live' | 'archived' | 'deleted';
  created_at: string;
  encrypted_content: string;
  encryption_key_hash: string;
  priority: number;
  report_type: string;
  tags?: string[];
  assigned_to?: string;
  first_read_at?: string;
  closed_at?: string;
  archived_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  organizations?: {
    name: string;
  };
  submitted_by_email?: string;
  ai_risk_score?: number;
  ai_risk_level?: string;
  ai_likelihood_score?: number;
  ai_impact_score?: number;
  ai_risk_assessment?: any;
  ai_assessed_at?: string;
  manual_risk_level?: number;
  incident_date?: string | null;
  location?: string | null;
  witnesses?: string | null;
  previous_reports?: boolean | null;
  additional_notes?: string | null;
}

// Helper functions for AI Triage user-friendly labels
const getSeverityScore = (aiRiskScore?: number): number => {
  // Convert AI risk score (0-25) to severity (0-10)
  if (!aiRiskScore) return 0;
  return Math.round((aiRiskScore / 25) * 10);
};

const getSeverityDescription = (severity: number): string => {
  if (severity >= 8) return "Critical - Immediate action needed";
  if (severity >= 6) return "Significant impact likely";
  if (severity >= 4) return "Moderate concern";
  if (severity >= 2) return "Minor issue";
  return "Low priority";
};

const getConfidencePercentage = (likelihoodScore?: number): number => {
  // Convert likelihood (0-5) to confidence percentage
  if (!likelihoodScore) return 0;
  return Math.round((likelihoodScore / 5) * 100);
};

const getUrgencyLevel = (riskLevel?: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (!riskLevel) return 'LOW';
  if (riskLevel === 'Critical' || riskLevel === 'High') return 'HIGH';
  if (riskLevel === 'Medium') return 'MEDIUM';
  return 'LOW';
};

const getUrgencyIcon = (urgency: 'HIGH' | 'MEDIUM' | 'LOW') => {
  switch(urgency) {
    case 'HIGH': return Flame;
    case 'MEDIUM': return Clock;
    case 'LOW': return CheckCircle;
  }
};

const getUrgencyColor = (urgency: 'HIGH' | 'MEDIUM' | 'LOW'): string => {
  switch(urgency) {
    case 'HIGH': return 'text-red-600 bg-red-50';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
    case 'LOW': return 'text-green-600 bg-green-50';
  }
};

const getTimelineText = (urgency: 'HIGH' | 'MEDIUM' | 'LOW'): string => {
  switch(urgency) {
    case 'HIGH': return 'Review within 24 hours';
    case 'MEDIUM': return 'Review within 3 days';
    case 'LOW': return 'Review within 7 days';
  }
};

const getHandlerRecommendation = (urgency: 'HIGH' | 'MEDIUM' | 'LOW'): string => {
  switch(urgency) {
    case 'HIGH': return 'Senior case handler recommended';
    case 'MEDIUM': return 'Standard case handler';
    case 'LOW': return 'Any available handler';
  }
};

const DashboardView = () => {
  const { user, subscriptionData } = useAuth();
  const { isOrgAdmin, loading: rolesLoading } = useUserRoles();
  const { customDomain, organizationId } = useCustomDomain();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Navigation lock to prevent gesture racing
  const isNavigatingRef = useRef(false);
  
  // Get organization ID from multiple sources
  const effectiveOrganizationId = organizationId || organization?.id;
  
  const [reports, setReports] = useState<Report[]>([]);
  const [archivedReports, setArchivedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'created_at' | 'title' | 'tracking_id' | 'ai_risk_score'>('created_at');
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [reportCategories, setReportCategories] = useState<Record<string, string>>({});
  const [decryptedCategories, setDecryptedCategories] = useState<Record<string, { main: string; sub: string }>>({});
  const [isAssessingRisk, setIsAssessingRisk] = useState<string | null>(null);
  const [updatingRiskLevel, setUpdatingRiskLevel] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patterns, setPatterns] = useState<PatternDetectionResult | null>(null);
  const [highlightedReportIds, setHighlightedReportIds] = useState<string[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [smartFilters, setSmartFilters] = useState<SmartFilter[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Pagination state for active reports
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Pagination state for archived reports
  const [archivedCurrentPage, setArchivedCurrentPage] = useState(1);
  const [archivedPageSize, setArchivedPageSize] = useState(25);
  const [processingReportId, setProcessingReportId] = useState<string | null>(null);
  const [exportingReportId, setExportingReportId] = useState<string | null>(null);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
  const [updatingStatusReportId, setUpdatingStatusReportId] = useState<string | null>(null);
  const [aiTriageReportId, setAiTriageReportId] = useState<string | null>(null);

  // Reusable AI Triage Details Component
  const renderAITriageDetails = (report: Report) => (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">{t('ai.caseTriage')}</h4>
        </div>
        <Badge variant={
          getUrgencyLevel(report.ai_risk_level) === 'HIGH' ? 'destructive' :
          getUrgencyLevel(report.ai_risk_level) === 'MEDIUM' ? 'default' :
          'secondary'
        }>
          {getUrgencyLevel(report.ai_risk_level)}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        This case {getUrgencyLevel(report.ai_risk_level) === 'HIGH' ? 'needs urgent attention' :
                   getUrgencyLevel(report.ai_risk_level) === 'MEDIUM' ? 'requires prompt review' :
                   'can be handled in standard timeline'}
      </p>

      {/* Severity Score */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{t('ai.severity')}</span>
          <span className="text-sm font-bold">{getSeverityScore(report.ai_risk_score)}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              getSeverityScore(report.ai_risk_score) >= 8 ? 'bg-red-600' :
              getSeverityScore(report.ai_risk_score) >= 6 ? 'bg-orange-500' :
              getSeverityScore(report.ai_risk_score) >= 4 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{width: `${(getSeverityScore(report.ai_risk_score)/10)*100}%`}}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {getSeverityDescription(getSeverityScore(report.ai_risk_score))}
        </p>
      </div>

      {/* AI Confidence */}
      <div className="flex justify-between items-center pt-2 border-t">
        <div>
          <div className="text-sm font-medium">{t('ai.confidence')}</div>
          <div className="text-xs text-muted-foreground">{t('ai.confidenceDescription')}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{getConfidencePercentage(report.ai_likelihood_score)}%</div>
        </div>
      </div>

      {/* Suggested Action */}
      <div className="pt-3 border-t bg-blue-50 -mx-4 px-4 py-3 rounded-b-lg">
        <div className="text-xs font-semibold text-blue-900 mb-2">Suggested Action:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{getTimelineText(getUrgencyLevel(report.ai_risk_level))}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <User className="w-4 h-4 flex-shrink-0" />
            <span>{getHandlerRecommendation(getUrgencyLevel(report.ai_risk_level))}</span>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      {report.ai_assessed_at && (
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Triaged: {new Date(report.ai_assessed_at).toLocaleDateString()} at {new Date(report.ai_assessed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (user && !rolesLoading) {
      fetchData();
    }
  }, [user, rolesLoading, isOrgAdmin]);

  // Pattern Detection: Run when reports change
  useEffect(() => {
    const runPatternDetection = async () => {
      if (reports.length < 3 || !effectiveOrganizationId) return; // Need minimum data for patterns

      // Decrypt report contents for name detection
      const decryptedContents = new Map<string, string>();

      for (const report of reports) {
        try {
          if (report.encrypted_content && effectiveOrganizationId) {
            // Use organization_id from report if available, otherwise use effectiveOrganizationId
            const orgId = (report as any).organization_id || effectiveOrganizationId;
            const decrypted = await decryptReport(report.encrypted_content, orgId);
            
            // Convert decrypted object to string format for pattern detection
            // Pattern detection searches for names in the text, so combine all text fields
            let decryptedString = '';
            if (typeof decrypted === 'string') {
              decryptedString = decrypted;
            } else if (decrypted && typeof decrypted === 'object') {
              // Combine all text fields from decrypted report
              const fields = [
                decrypted.category,
                decrypted.description,
                decrypted.location,
                decrypted.witnesses,
                decrypted.evidence,
                decrypted.additionalDetails
              ].filter(Boolean);
              decryptedString = fields.join(' ');
            }
            
            if (decryptedString) {
              decryptedContents.set(report.id, decryptedString);
            }
          }
        } catch (error) {
          // Silently skip reports that can't be decrypted (might be from different org or corrupted)
          // This is expected for some reports, so we don't log it as an error
          console.debug('Skipping report for pattern detection (decryption failed):', report.id);
        }
      }

      // Run pattern detection
      const detectedPatterns = await detectAllPatterns(reports, decryptedContents);


      if (detectedPatterns.totalPatterns > 0) {
        setPatterns(detectedPatterns);
        
        // Create notifications for pattern alerts (persist even when dismissed from dashboard)
        if (user && effectiveOrganizationId) {
          try {
            // Check if we've already created notifications for these patterns
            // We'll create one notification per pattern type to avoid duplicates
            const { data: existingNotifications } = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', user.id)
              .eq('type', 'pattern_alert')
              .eq('is_read', false)
              .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
              .limit(1);
            
            // Only create notification if we don't have a recent unread one
            if (!existingNotifications || existingNotifications.length === 0) {
              const patternTypes = [];
              if (detectedPatterns.repeatedNames.length > 0) {
                patternTypes.push(`${detectedPatterns.repeatedNames.length} repeated name${detectedPatterns.repeatedNames.length > 1 ? 's' : ''}`);
              }
              if (detectedPatterns.categorySpikes.length > 0) {
                patternTypes.push(`${detectedPatterns.categorySpikes.length} category spike${detectedPatterns.categorySpikes.length > 1 ? 's' : ''}`);
              }
              if (detectedPatterns.timeClusters.length > 0) {
                patternTypes.push(`${detectedPatterns.timeClusters.length} time cluster${detectedPatterns.timeClusters.length > 1 ? 's' : ''}`);
              }
              
              const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                  user_id: user.id,
                  organization_id: effectiveOrganizationId,
                  type: 'pattern_alert',
                  title: 'Pattern Detection Alert',
                  message: `Detected ${detectedPatterns.totalPatterns} suspicious pattern${detectedPatterns.totalPatterns > 1 ? 's' : ''}: ${patternTypes.join(', ')}`,
                  metadata: {
                    total_patterns: detectedPatterns.totalPatterns,
                    high_severity_count: detectedPatterns.highSeverityCount,
                    repeated_names_count: detectedPatterns.repeatedNames.length,
                    category_spikes_count: detectedPatterns.categorySpikes.length,
                    time_clusters_count: detectedPatterns.timeClusters.length,
                  }
                });
              
              if (notifError) {
                console.error('Error creating pattern alert notification:', notifError);
              }
            }
          } catch (error) {
            console.error('Error creating pattern alert notification:', error);
          }
        }
      }
    };

    runPatternDetection();
  }, [reports]);

  // Initialize smart filters when reports change
  useEffect(() => {
    if (reports.length > 0) {
      setSmartFilters(createSmartFilters(reports));
    }
  }, [reports]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }


      // First, let's check what reports exist in the database
      const { data: allReports, error: allReportsError } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, organization_id')
        .eq('organization_id', profile.organization_id);
      

      // First, try to fetch with AI fields, fallback to basic fields if they don't exist
      let reportsData, archivedData;
      
      try {
        // Try with AI fields first
        let reportsQuery = supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, ai_risk_score, ai_risk_level, ai_likelihood_score, ai_impact_score, ai_risk_assessment, ai_assessed_at, manual_risk_level, incident_date, location, witnesses, previous_reports, additional_notes')
          .eq('organization_id', profile.organization_id)
          .not('status', 'in', '(archived,deleted)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        // Add filtering for team members
        if (isOrgAdmin === false && rolesLoading === false) {
          reportsQuery = reportsQuery.eq('assigned_to', user?.id);
        } else {
        }

        const { data: reportsWithAI, error: reportsError } = await reportsQuery;

        if (reportsError) {
          throw reportsError;
        }
        reportsData = reportsWithAI;

        const { data: archivedWithAI, error: archivedError } = await supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, incident_date, location, witnesses, previous_reports, additional_notes')
          .eq('organization_id', profile.organization_id)
          .eq('status', 'archived')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        // Add filtering for archived reports
        if (isOrgAdmin === false && rolesLoading === false) {
          // Note: We can't modify the query after it's executed, so we'll filter the results
          if (archivedWithAI) {
            archivedData = archivedWithAI.filter(report => report.assigned_to === user?.id);
          }
        } else {
          archivedData = archivedWithAI;
        }

      } catch (aiError) {
        
        // Fallback to basic query without AI fields
        let reportsBasicQuery = supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, manual_risk_level, incident_date, location, witnesses, previous_reports, additional_notes')
          .eq('organization_id', profile.organization_id)
          .not('status', 'in', '(archived,deleted)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        // Add filtering for team members in fallback query
        if (isOrgAdmin === false && rolesLoading === false) {
          reportsBasicQuery = reportsBasicQuery.eq('assigned_to', user?.id);
        }

        const { data: reportsBasic, error: reportsBasicError } = await reportsBasicQuery;

        if (reportsBasicError) throw reportsBasicError;
        reportsData = reportsBasic;

        const { data: archivedBasic, error: archivedBasicError } = await supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, incident_date, location, witnesses, previous_reports, additional_notes')
          .eq('organization_id', profile.organization_id)
          .eq('status', 'archived')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (archivedBasicError) throw archivedBasicError;
        
        // Add filtering for archived reports in fallback
        if (isOrgAdmin === false && rolesLoading === false) {
          archivedData = archivedBasic?.filter(report => report.assigned_to === user?.id) || [];
        } else {
          archivedData = archivedBasic;
        }
      }

      setReports(reportsData || []);
      setArchivedReports(archivedData || []);

      // Decrypt categories for display (both active and archived)
      if ((reportsData || archivedData) && profile?.organization_id) {
        const categories: Record<string, { main: string; sub: string }> = {};
        const allReports = [...(reportsData || []), ...(archivedData || [])];
        for (const report of allReports) {
          try {
            if (report.encrypted_content) {
              const decrypted = await decryptReport(report.encrypted_content, profile.organization_id);
              if (decrypted && decrypted.category) {
                const parts = decrypted.category.split(' - ');
                categories[report.id] = {
                  main: parts[0] || decrypted.category,
                  sub: parts[1] || ''
                };
              }
            }
          } catch (error) {
            log.error(LogContext.ENCRYPTION, 'Failed to decrypt category for report', error as Error, { reportId: report.id });
          }
        }
        setDecryptedCategories(categories);
      }

      // Fetch team members for assignment
      const { data: teamData, error: teamError } = await supabase
        .from('profiles')
        .select(`
          id, 
          email, 
          first_name, 
          last_name,
          user_roles!inner(role, is_active)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .eq('user_roles.is_active', true);

      if (teamError) {
        log.error(LogContext.DATABASE, 'Error fetching team members', teamError as Error);
      } else {
        setTeamMembers(teamData || []);
      }
    } catch (error) {
      log.error(LogContext.DATABASE, 'Error fetching dashboard data', error as Error);
      toast({
        title: "Error",
        description: "Failed to load reports. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignReport = async (reportId: string, assigneeId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const assignee = teamMembers.find(m => m.id === assigneeId);
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          assigned_to: assigneeId === 'unassigned' ? null : assigneeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      
      // Log assignment to audit trail
      if (report && effectiveOrganizationId && user) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: assigneeId === 'unassigned' ? 'Unassigned' : 'Assigned',
          severity: 'medium',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: effectiveOrganizationId,
          targetType: 'case',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: assigneeId === 'unassigned' 
            ? `Case ${report.tracking_id} unassigned`
            : `Case ${report.tracking_id} assigned to ${assignee?.first_name || assignee?.email || 'user'}`,
          description: `Assignment changed for "${report.title}"`,
          beforeState: { assigned_to: report.assigned_to },
          afterState: { assigned_to: assigneeId === 'unassigned' ? null : assigneeId },
          metadata: {
            report_type: report.report_type,
            priority: report.priority,
            assignee_email: assignee?.email,
            assignee_name: assignee?.first_name && assignee?.last_name 
              ? `${assignee.first_name} ${assignee.last_name}`
              : assignee?.email
          },
        });
      }
      
      await fetchData();
      toast({
        title: "Success",
        description: assigneeId === 'unassigned' 
          ? "Report unassigned successfully" 
          : `Report assigned to ${assignee?.first_name || assignee?.email}`,
      });
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error assigning report', error as Error, { reportId, assigneeId });
      toast({
        title: "Error",
        description: "Failed to assign report",
        variant: "destructive",
      });
    }
  };

  const handleViewReport = async (report: Report) => {
    // Prevent rapid navigation (gesture racing protection)
    if (isNavigatingRef.current) {
      return;
    }

    // On mobile, navigate to full page. On desktop, use modal
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Set navigation lock
      isNavigatingRef.current = true;
      
      navigate(`/dashboard/reports/${report.id}`);
      
      // Release lock after navigation completes
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    } else {
      setSelectedReport(report);
      setIsReportDialogOpen(true);
      
      // Automatically change status from "new" to "new" when first viewed (desktop only)
      if (report.status === 'new') {
        try {
          const { error } = await supabase
            .from('reports')
            .update({ 
              status: 'new',
              first_read_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', report.id);

          if (error) throw error;

        // Log audit event
        if (effectiveOrganizationId) {
          await log.info(LogContext.CASE_MANAGEMENT, 'Report status updated', {
            reportId: report.id,
            userId: user?.id,
            userEmail: user?.email,
            organizationId: effectiveOrganizationId
          });
        } else {
        }

        // Update local state
        setReports(prevReports => 
          prevReports.map(r => 
            r.id === report.id 
              ? { ...r, status: 'new' as const, first_read_at: new Date().toISOString() }
              : r
          )
        );
        } catch (error) {
          log.error(LogContext.CASE_MANAGEMENT, 'Error updating report status', error as Error, { reportId: report.id });
        }
      }
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    setProcessingReportId(reportId);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log audit event
      const reportToArchive = reports.find(r => r.id === reportId);
      if (reportToArchive && effectiveOrganizationId) {
        await log.info(LogContext.CASE_MANAGEMENT, 'Report archived', {
          reportId: reportToArchive.id,
          userId: user?.id,
          userEmail: user?.email,
          organizationId: effectiveOrganizationId
        });
      }

      toast({
        title: "Report archived",
        description: "The report has been moved to archived status",
      });

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingReportId(null);
    }
  };

  const handleUnarchiveReport = async (reportId: string) => {
    setProcessingReportId(reportId);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'new',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report unarchived",
        description: "The report has been moved back to active status",
      });

      setArchivedReports(prevReports => prevReports.filter(report => report.id !== reportId));
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unarchive report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingReportId(null);
    }
  };

  const assessRisk = async (reportId: string) => {
    setIsAssessingRisk(reportId);
    try {
      
      // Get the report data
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      // Get user's organization ID (will be used for audit logging)
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) throw new Error('User organization not found');

      // Decrypt the report content
      const decryptedContent = await decryptReport(report.encrypted_content, profile.organization_id);
      
      // Format content for AI analysis
      const formattedContent = `
Category: ${decryptedContent.category || 'Not specified'}
Description: ${decryptedContent.description || 'Not provided'}
Location: ${decryptedContent.location || 'Not specified'}
Date of Incident: ${decryptedContent.dateOfIncident || 'Not specified'}
Witnesses: ${decryptedContent.witnesses || 'None mentioned'}
Evidence: ${decryptedContent.evidence || 'No evidence provided'}
Additional Details: ${decryptedContent.additionalDetails || 'None provided'}
      `.trim();

      
      // Call the AI risk assessment function
      const { data, error } = await supabase.functions.invoke('assess-risk-with-ai', {
        body: {
          reportData: {
            title: report.title,
            tracking_id: report.tracking_id,
            status: report.status,
            report_type: report.report_type,
            created_at: report.created_at
          },
          reportContent: formattedContent
        }
      });

      if (error) {
        log.error(LogContext.AI_ANALYSIS, 'AI risk assessment error', error as Error, { reportId });
        throw error;
      }


      // Update the report with AI risk assessment
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          ai_risk_score: data.riskAssessment.risk_score,
          ai_likelihood_score: data.riskAssessment.likelihood_score,
          ai_impact_score: data.riskAssessment.impact_score,
          ai_risk_level: data.riskAssessment.risk_level,
          ai_risk_assessment: data.riskAssessment,
          ai_assessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) {
        log.error(LogContext.DATABASE, 'Database update error during AI risk assessment', updateError as Error, { reportId });
        throw updateError;
      }


      // Log AI risk assessment to audit trail
      await log.info(LogContext.CASE_MANAGEMENT, 'AI risk assessment completed', {
        reportId: report.id,
        userId: user?.id,
        userEmail: user?.email,
        organizationId: profile.organization_id
      });

      toast({
        title: "Risk Assessment Complete",
        description: `Risk Score: ${data.riskAssessment.risk_score} (${data.riskAssessment.risk_level})`,
      });

      // Refresh the data
      fetchData();
    } catch (error) {
      log.error(LogContext.AI_ANALYSIS, 'Error assessing risk', error as Error, { reportId });
      toast({
        title: "Error",
        description: `Failed to assess risk: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsAssessingRisk(null);
    }
  };

  // Export individual report as PDF
  const exportReportToPDF = async (report: Report) => {
    setExportingReportId(report.id);
    try {
      toast({ title: "Generating PDF...", description: "Please wait" });

      // Get user's organization ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations(name)')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) throw new Error('User organization not found');

      // Decrypt the report content
      const decryptedContent = await decryptReport(report.encrypted_content, profile.organization_id);

      // Create PDF with organization name
      const orgName = profile.organizations?.name || 'Unknown Organization';
      const doc = createBrandedPDF('Case Report', orgName);

      let y = 50;

      // Report Header
      y = addPDFSection(doc, 'Report Details', y);
      y = addPDFField(doc, 'Tracking ID', report.tracking_id, y);
      y = addPDFField(doc, 'Title', report.title, y);
      y = addPDFField(doc, 'Status', report.status.toUpperCase(), y);
      y = addPDFField(doc, 'Submitted Date', formatExportDate(report.created_at), y);
      
      if (report.manual_risk_level) {
        const riskText = ['Critical', 'High', 'Medium', 'Low', 'Info'][report.manual_risk_level - 1] || 'Unknown';
        y = addPDFField(doc, 'Risk Level', `${riskText} (${report.manual_risk_level}/5)`, y);
      }

      if (report.tags && report.tags.length > 0) {
        y = addPDFField(doc, 'Tags', report.tags.join(', '), y);
      }

      // Report Content
      y += 5;
      y = addPDFSection(doc, 'Report Content', y);
      y = addPDFField(doc, 'Category', decryptedContent.category || 'Not specified', y);
      y = addPDFField(doc, 'Description', decryptedContent.description || 'Not provided', y);
      y = addPDFField(doc, 'Location', decryptedContent.location || 'Not specified', y);
      y = addPDFField(doc, 'Date of Incident', decryptedContent.dateOfIncident || 'Not specified', y);
      y = addPDFField(doc, 'Witnesses', decryptedContent.witnesses || 'None mentioned', y);
      y = addPDFField(doc, 'Evidence', decryptedContent.evidence || 'No evidence provided', y);
      y = addPDFField(doc, 'Additional Details', decryptedContent.additionalDetails || 'None provided', y);

      // AI Risk Assessment (if available)
      if (report.ai_risk_assessment) {
        y += 5;
        y = addPDFSection(doc, 'AI Risk Assessment', y);
        y = addPDFField(doc, 'Risk Level', report.ai_risk_level || 'N/A', y);
        y = addPDFField(doc, 'Risk Score', `${report.ai_risk_score || 'N/A'}/10`, y);
        y = addPDFField(doc, 'Likelihood', `${report.ai_likelihood_score || 'N/A'}/10`, y);
        y = addPDFField(doc, 'Impact', `${report.ai_impact_score || 'N/A'}/10`, y);
        if (report.ai_risk_assessment.key_concerns) {
          y = addPDFField(doc, 'Key Concerns', report.ai_risk_assessment.key_concerns.join(', '), y);
        }
      }

      // Download the PDF
      downloadPDF(doc, `case-report-${report.tracking_id}`);
      await log.info(LogContext.CASE_MANAGEMENT, 'Case report exported as PDF', {
        reportId: report.id,
        userId: user?.id,
        userEmail: user?.email,
        organizationId: profile.organization_id
      });

      toast({ 
        title: "PDF Generated", 
        description: "Case report downloaded successfully" 
      });
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error generating PDF', error as Error, { reportId: report.id });
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setExportingReportId(null);
    }
  };

  // Export filtered reports as CSV
  const exportReportsToCSV = async () => {
    try {
      toast({ title: "Generating CSV...", description: "Please wait" });

      const filtered = filteredReports;
      if (filtered.length === 0) {
        toast({
          title: "No Data",
          description: "No reports to export",
          variant: "destructive",
        });
        return;
      }

      // Get assigned user names
      const teamMemberMap = new Map(
        teamMembers.map(member => [
          member.id,
          member.first_name && member.last_name
            ? `${member.first_name} ${member.last_name}`
            : member.email
        ])
      );

      // Format data for CSV
      const csvData = filtered.map(report => ({
        'Tracking ID': report.tracking_id,
        'Title': report.title,
        'Status': report.status,
        'Tags': report.tags ? report.tags.join('; ') : '',
        'Risk Level': report.manual_risk_level 
          ? `${['Critical', 'High', 'Medium', 'Low', 'Info'][report.manual_risk_level - 1]} (${report.manual_risk_level}/5)`
          : '',
        'AI Risk': report.ai_risk_level || '',
        'AI Risk Score': report.ai_risk_score || '',
        'Assigned To': report.assigned_to ? (teamMemberMap.get(report.assigned_to) || 'Unknown') : 'Unassigned',
        'Submitted Date': formatExportDate(report.created_at),
        'First Read': report.first_read_at ? formatExportDate(report.first_read_at) : 'Not read',
        'Closed Date': report.closed_at ? formatExportDate(report.closed_at) : '',
      }));

      // Get user's organization ID for audit log
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (profile?.organization_id) {
        await log.info(LogContext.CASE_MANAGEMENT, 'Cases exported as CSV', {
          exportCount: csvData.length,
          userId: user?.id,
          userEmail: user?.email,
          organizationId: profile.organization_id
        });
      }

      exportToCSV(csvData, `cases-export-${new Date().toISOString().split('T')[0]}`);

      toast({ 
        title: "CSV Generated", 
        description: `${csvData.length} cases exported successfully` 
      });
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error generating CSV', error as Error);
      toast({
        title: "Error",
        description: "Failed to generate CSV",
        variant: "destructive",
      });
    }
  };

  const updateManualRiskLevel = async (reportId: string, riskLevel: number) => {
    setUpdatingRiskLevel(reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      
      const { error } = await supabase
        .from('reports')
        .update({
          manual_risk_level: riskLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log to audit trail
      if (report && effectiveOrganizationId && user) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'Risk level updated',
          severity: 'medium',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: effectiveOrganizationId,
          targetType: 'case',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Manual risk level updated for case ${report.tracking_id} from ${report.manual_risk_level || 'N/A'} to ${riskLevel}`,
          description: `Risk level changed for "${report.title}"`,
          beforeState: { manual_risk_level: report.manual_risk_level },
          afterState: { manual_risk_level: riskLevel },
          metadata: {
            report_type: report.report_type,
            priority: report.priority,
          },
        });
      }

      toast({
        title: "Risk Level Updated",
        description: `Manual risk level set to ${riskLevel}/5`,
      });

      // Update local state
      setReports(prevReports =>
        prevReports.map(r =>
          r.id === reportId
            ? { ...r, manual_risk_level: riskLevel }
            : r
        )
      );
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error updating risk level', error as Error, { reportId, riskLevel });
      toast({
        title: "Error",
        description: "Failed to update risk level. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRiskLevel(null);
    }
  };


  // Bulk Actions Handlers
  const handleBulkStatusUpdate = async (status: string) => {
    setIsBulkProcessing(true);
    try {
      const reportsToUpdate = reports.filter(r => selectedReportIds.includes(r.id));
      
      const { error } = await supabase
        .from('reports')
        .update({ status: status as Report['status'], updated_at: new Date().toISOString() })
        .in('id', selectedReportIds);

      if (error) throw error;

      // Log bulk status update to audit trail
      if (effectiveOrganizationId && user && reportsToUpdate.length > 0) {
        for (const report of reportsToUpdate) {
          await auditLogger.log({
            eventType: 'case.update',
            category: 'case_management',
            action: 'Bulk status update',
            severity: 'medium',
            actorType: 'user',
            actorId: user.id,
            actorEmail: user.email,
            organizationId: effectiveOrganizationId,
            targetType: 'case',
            targetId: report.id,
            targetName: report.tracking_id,
            summary: `Bulk status update: Case ${report.tracking_id} status changed to ${status}`,
            description: `Status updated for "${report.title}" as part of bulk operation`,
            beforeState: { status: report.status },
            afterState: { status: status as Report['status'] },
            metadata: {
              report_type: report.report_type,
              priority: report.priority,
              bulk_operation: true,
              total_reports_updated: selectedReportIds.length
            },
          });
        }
      }

      toast({
        title: "Status Updated",
        description: `${selectedReportIds.length} report(s) marked as ${status}`,
      });

      // Update local state
      setReports(prevReports =>
        prevReports.map(r =>
          selectedReportIds.includes(r.id)
            ? { ...r, status: status as Report['status'] }
            : r
        )
      );

      setSelectedReportIds([]);
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error bulk updating status', error as Error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkAssign = async (userId: string) => {
    setIsBulkProcessing(true);
    try {
      const assigneeId = userId === 'unassigned' ? null : userId;

      const { error } = await supabase
        .from('reports')
        .update({ assigned_to: assigneeId, updated_at: new Date().toISOString() })
        .in('id', selectedReportIds);

      if (error) throw error;

      toast({
        title: "Reports Assigned",
        description: `${selectedReportIds.length} report(s) assigned successfully`,
      });

      // Update local state
      setReports(prevReports =>
        prevReports.map(r =>
          selectedReportIds.includes(r.id)
            ? { ...r, assigned_to: assigneeId }
            : r
        )
      );

      setSelectedReportIds([]);
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error bulk assigning', error as Error);
      toast({
        title: "Error",
        description: "Failed to assign reports",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .in('id', selectedReportIds);

      if (error) throw error;

      toast({
        title: "Reports Archived",
        description: `${selectedReportIds.length} report(s) archived successfully`,
      });

      // Move to archived list
      const archivedReports = reports.filter(r => selectedReportIds.includes(r.id));
      setReports(prevReports => prevReports.filter(r => !selectedReportIds.includes(r.id)));
      setArchivedReports(prev => [...prev, ...archivedReports.map(r => ({ ...r, status: 'archived' as Report['status'] }))]);

      setSelectedReportIds([]);
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error bulk archiving', error as Error);
      toast({
        title: "Error",
        description: "Failed to archive reports",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', selectedReportIds);

      if (error) throw error;

      toast({
        title: "Reports Deleted",
        description: `${selectedReportIds.length} report(s) deleted successfully`,
      });

      setReports(prevReports => prevReports.filter(r => !selectedReportIds.includes(r.id)));
      setSelectedReportIds([]);
    } catch (error) {
      log.error(LogContext.CASE_MANAGEMENT, 'Error bulk deleting', error as Error);
      toast({
        title: "Error",
        description: "Failed to delete reports",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Smart Filter Handlers
  const handleSmartFilterToggle = (filterId: string) => {
    setSmartFilters(prevFilters =>
      prevFilters.map(f =>
        f.id === filterId ? { ...f, active: !f.active } : f
      )
    );
  };

  const handleClearSmartFilters = () => {
    setSmartFilters(prevFilters =>
      prevFilters.map(f => ({ ...f, active: false }))
    );
  };

  // Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReportIds(filteredReports.map(r => r.id));
    } else {
      setSelectedReportIds([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReportIds(prev => [...prev, reportId]);
    } else {
      setSelectedReportIds(prev => prev.filter(id => id !== reportId));
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    // Apply smart filters
    const activeFilters = smartFilters.filter(f => f.active);
    if (activeFilters.length > 0) {
      const matchesSmartFilters = activeFilters.every(filter => {
        switch (filter.id) {
          case 'high-risk':
            return report.ai_risk_level === 'Critical' || report.ai_risk_level === 'High' ||
                   report.manual_risk_level === 1 || report.manual_risk_level === 2;
          case 'unassigned':
            return !report.assigned_to;
          case 'recent':
            const daysDiff = (Date.now() - new Date(report.created_at).getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
          case 'ai-triaged':
            return report.ai_risk_score && report.ai_risk_score > 0;
          case 'needs-action':
            return report.status === 'new' || report.status === 'reviewing';
          default:
            return true;
        }
      });
      return matchesSearch && matchesStatus && matchesSmartFilters;
    }

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    if (sortField === 'ai_risk_score') {
      // Handle AI risk score sorting (nulls last)
      aValue = a.ai_risk_score ?? -1;
      bValue = b.ai_risk_score ?? -1;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination calculations for active reports
  const totalReports = filteredReports.length;
  const totalPages = Math.ceil(totalReports / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalReports);
  const paginatedReports = filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Pagination calculations for archived reports
  const totalArchived = archivedReports.length;
  const totalArchivedPages = Math.ceil(totalArchived / archivedPageSize);
  const archivedStartRecord = (archivedCurrentPage - 1) * archivedPageSize + 1;
  const archivedEndRecord = Math.min(archivedCurrentPage * archivedPageSize, totalArchived);
  const paginatedArchivedReports = archivedReports.slice((archivedCurrentPage - 1) * archivedPageSize, archivedCurrentPage * archivedPageSize);

  // Pagination handlers for active reports
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Pagination handlers for archived reports
  const handleArchivedPageChange = (page: number) => {
    setArchivedCurrentPage(page);
  };

  const handleArchivedPageSizeChange = (newSize: number) => {
    setArchivedPageSize(newSize);
    setArchivedCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortField, sortDirection, smartFilters]);

  // Calculate and apply height constraint accounting for alerts and measure space
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ============================================================================
  // LOCKED: Dashboard Layout & Scroll Control - DO NOT MODIFY WITHOUT EXPLICIT APPROVAL
  // ============================================================================
  // This useLayoutEffect is CRITICAL for preventing page scroll and initial scrollbar flash.
  // It applies body styles synchronously before paint using useLayoutEffect (not useEffect).
  // 
  // Key points:
  // - useLayoutEffect runs synchronously before browser paint (prevents scrollbar flash)
  // - Body is set to position: fixed with exact viewport height on desktop
  // - Mobile uses natural scrolling (conditional based on isMobile state)
  // - Content container height is calculated dynamically accounting for alerts
  // - Row heights are locked at 15px for both active and archived tables
  // 
  // DO NOT:
  // - Change useLayoutEffect back to useEffect (causes scrollbar flash)
  // - Remove the immediate updateContentHeight() call
  // - Change the body position: fixed logic for desktop
  // - Modify row heights without explicit approval
  // - Remove overflow: hidden constraints
  // ============================================================================
  useLayoutEffect(() => {
    const updateContentHeight = () => {

      const subscriptionAlert = document.querySelector('[data-dashboard-alert-subscription]');
      const contentContainer = document.querySelector('[data-dashboard-content]') as HTMLElement;
      const card = document.querySelector('[data-dashboard-card-active]') as HTMLElement;
      const tableContainer = document.querySelector('[data-dashboard-table-active]') as HTMLElement;
      const rootContainer = document.querySelector('[data-dashboard-root]') as HTMLElement;
      const contentWrapper = document.querySelector('[data-dashboard-wrapper]') as HTMLElement;
      
      if (contentContainer && rootContainer) {
        const subscriptionHeight = subscriptionAlert ? subscriptionAlert.clientHeight + 16 : 0; // +16 for mt-4
        const totalAlertsHeight = subscriptionHeight;
        const viewportHeight = window.innerHeight;
        const headerHeight = 64; // 4rem = 64px
        const contentPadding = 16; // pt-4 = 16px
        const calculatedContentHeight = viewportHeight - headerHeight - totalAlertsHeight - contentPadding;
        const rootHeight = viewportHeight - headerHeight;
        
        // Constrain body to prevent page scroll (desktop only - mobile needs natural scrolling)
        if (!isMobile) {

          // Force body to exact viewport height to eliminate any scroll
          document.body.style.overflow = 'hidden';
          document.body.style.height = `${viewportHeight}px`;
          document.body.style.maxHeight = `${viewportHeight}px`;
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.top = '0';
          document.body.style.left = '0';
        } else {
          // On mobile, allow natural body scrolling
          document.body.style.overflow = '';
          document.body.style.height = '';
          document.body.style.maxHeight = '';
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.top = '';
          document.body.style.left = '';
        }
        
        // Set root container height to exactly fit viewport (desktop only)
        if (!isMobile) {
          rootContainer.style.height = `${rootHeight}px`;
          rootContainer.style.maxHeight = `${rootHeight}px`;
          rootContainer.style.overflow = 'hidden';
          rootContainer.style.margin = '0';
          rootContainer.style.padding = '0';
          
          // Set content wrapper to fill remaining space
          if (contentWrapper) {
            contentWrapper.style.overflow = 'hidden';
            contentWrapper.style.maxHeight = '100%';
            contentWrapper.style.margin = '0';
            contentWrapper.style.padding = '0';
          }
          
          // Set max-height to constrain the content area - reduce by 1px to prevent any overflow
          contentContainer.style.maxHeight = `${calculatedContentHeight - 1}px`;
          contentContainer.style.height = `${calculatedContentHeight - 1}px`;
          contentContainer.style.overflow = 'hidden';
        } else {
          // On mobile, allow natural flow
          rootContainer.style.height = '';
          rootContainer.style.maxHeight = '';
          rootContainer.style.overflow = '';
          if (contentWrapper) {
            contentWrapper.style.overflow = '';
            contentWrapper.style.maxHeight = '';
          }
          contentContainer.style.maxHeight = '';
          contentContainer.style.height = '';
          contentContainer.style.overflow = '';
        }
        
        // Measure actual heights to find extra space
        const measurements: any = {
          viewportHeight,
          headerHeight,
          subscriptionHeight: subscriptionAlert?.clientHeight || 0,
          totalAlertsHeight,
          contentPadding,
          calculatedContentHeight,
          rootHeight,
          rootContainerHeight: rootContainer.clientHeight,
          rootContainerScrollHeight: rootContainer.scrollHeight,
          rootContainerOffsetHeight: rootContainer.offsetHeight,
          contentWrapperHeight: contentWrapper?.clientHeight,
          contentWrapperScrollHeight: contentWrapper?.scrollHeight,
          contentContainerHeight: contentContainer.clientHeight,
          contentContainerScrollHeight: contentContainer.scrollHeight,
          contentContainerOffsetHeight: contentContainer.offsetHeight,
          cardHeight: card?.clientHeight,
          cardScrollHeight: card?.scrollHeight,
          tableContainerHeight: tableContainer?.clientHeight,
          tableContainerScrollHeight: tableContainer?.scrollHeight,
          documentBodyScrollHeight: document.body.scrollHeight,
          documentBodyClientHeight: document.body.clientHeight,
          extraSpace: contentContainer.scrollHeight - contentContainer.clientHeight,
          rootExtraSpace: rootContainer.scrollHeight - rootContainer.clientHeight,
          bodyExtraSpace: document.body.scrollHeight - window.innerHeight
        };
      }
    };
    
    // Apply styles immediately (synchronously) to prevent initial scrollbar
    updateContentHeight();
    
    // Also update after a short delay to catch any dynamic content that loads
    const timeoutId = setTimeout(updateContentHeight, 100);
    const timeoutId2 = setTimeout(updateContentHeight, 500);
    const timeoutId3 = setTimeout(() => {
      updateContentHeight();
    }, 1000);
    window.addEventListener('resize', updateContentHeight);
    
    // Monitor for style changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style' && mutation.target === document.body) {
          // Body style changed - no action needed
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['style']
    });
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      window.removeEventListener('resize', updateContentHeight);
      observer.disconnect();
    };
  }, [subscriptionData, patterns, isMobile]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ============================================================================
  // LOCKED: Root Container Structure - DO NOT MODIFY
  // ============================================================================
  // This root div structure is carefully calibrated to prevent page scrolling.
  // Desktop: Fixed height with overflow hidden
  // Mobile: Natural flow (empty style object)
  // ============================================================================
  return (
    <div
      className="flex flex-col"
      style={!isMobile ? { height: 'calc(100vh - 4rem)', overflow: 'hidden', maxHeight: 'calc(100vh - 4rem)' } : {}}
      data-dashboard-root
    >
      {/* Content - No scrolling, only table scrolls internally (desktop) */}
      <div 
        className="flex-1 overflow-hidden flex flex-col min-h-0" 
        style={!isMobile ? { overflow: 'hidden', maxHeight: '100%' } : {}}
        data-dashboard-wrapper
      >
        {/* Subscription Grace Period Warning - Hidden for pro users on mobile */}
        {subscriptionData && 
         (subscriptionData.isInGracePeriod || subscriptionData.subscription_status === 'past_due') && 
         subscriptionData.subscription_tier !== 'pro' && (
          <Alert className="border-yellow-500 bg-yellow-50 flex-shrink-0 mx-4 mt-4" data-dashboard-alert-subscription>
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Subscription Notice</AlertTitle>
            <AlertDescription className="text-yellow-700">
              {subscriptionData.isInGracePeriod ? (
                <>
                  Your subscription has expired. You're currently in a grace period with read-only access.
                  {subscriptionData.grace_period_ends_at && (
                    <> Grace period ends: {new Date(subscriptionData.grace_period_ends_at).toLocaleString()}</>
                  )}
                  {' '}Please renew your subscription to restore full access.
                </>
              ) : (
                <>
                  Your payment failed and your subscription is past due. Please update your payment method to restore full access.
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="ml-4 mt-2"
                onClick={() => navigate('/dashboard/settings?tab=subscription')}
              >
                Manage Subscription
              </Button>
            </AlertDescription>
          </Alert>
        )}


        <div className="flex-1 flex flex-col overflow-hidden min-h-0 px-4 pt-4 pb-0" data-dashboard-content style={{ overflow: 'hidden', maxHeight: '100%' }}>
          {/* Title and Subtitle */}
          <div className="flex-shrink-0 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">{t('reportsOverview')}</h2>
            <p className="text-muted-foreground break-words hyphens-auto">{t('manageAndReviewReports')}</p>
          </div>

          <Tabs defaultValue="active" className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Tabs, Search, and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-shrink-0 mb-4">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="active" className="flex-1 md:flex-none">{t('activeReports')} ({reports.length})</TabsTrigger>
              <TabsTrigger value="archived" className="flex-1 md:flex-none">{t('archived')} ({archivedReports.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
              <Input
                placeholder={t('searchReports')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 w-full sm:w-auto"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="new">{t('newIssue')}</SelectItem>
                  <SelectItem value="reviewing">{t('inReview')}</SelectItem>
                  <SelectItem value="investigating">{t('investigating')}</SelectItem>
                  <SelectItem value="resolved">{t('resolved')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={exportReportsToCSV}
                className="w-full sm:w-auto"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
            {/* LOCKED: Active Reports Tab - Card structure must use flex-1, overflow-hidden, min-h-0 */}
            <TabsContent value="active" className="flex flex-col overflow-hidden min-h-0">
              <Card className="md:border md:shadow-sm border-0 shadow-none flex flex-col flex-1 overflow-hidden min-h-0" data-dashboard-card-active>
                <CardContent className="p-0 sm:p-4 flex-1 flex flex-col overflow-hidden min-h-0 pb-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground px-6">
                  {isOrgAdmin ? (
                    t('noReportsFound')
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg font-medium text-gray-700">No Reports Assigned</div>
                      <div className="text-sm text-gray-500">
                        Reports that are assigned to you by your administrator will appear here
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View - Uses flex-1 to fill remaining space */}
                  <div className="hidden md:block flex-1 overflow-hidden flex flex-col min-h-0" data-dashboard-table-active>
                    {/* Scrollable table body */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0" style={{ maxHeight: 'calc(100% - 40px)' }}>
                      <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-2 py-1 text-xs">{t('trackingId')}</TableHead>
                          <TableHead className="px-2 py-1 text-xs">{t('title')}</TableHead>
                          <TableHead className="px-2 py-1 text-xs">{t('status')}</TableHead>
                          <TableHead className="px-2 py-1 text-xs">{t('category')}</TableHead>
                          <TableHead className="px-2 py-1 text-xs">{t('priority')}</TableHead>
                          <TableHead className="px-2 py-1 text-xs">{t('ai.triage')}</TableHead>
                          <TableHead className="px-2 py-1 text-xs">{t('assignedTo')}</TableHead>
                          <TableHead className="px-2 py-1 text-xs">{t('date')}</TableHead>
                          <TableHead className="text-right px-2 py-1 text-xs">{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedReports.map((report) => (
                          <TableRow
                            key={report.id}
                            className={highlightedReportIds.includes(report.id) ? 'bg-yellow-50 border-l-4 border-l-orange-400' : ''}
                            style={{ height: '15px' }}
                          >
                            <TableCell className="font-mono text-xs px-2 py-0">
                              <div className="flex items-center gap-2">
                                <span>{report.tracking_id}</span>
                                <button
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(report.tracking_id);
                                      setCopiedTrackingId(report.tracking_id);
                                      setTimeout(() => setCopiedTrackingId(null), 1000);
                                } catch (error) {
                                  log.error(LogContext.FRONTEND, 'Failed to copy tracking ID', error as Error);
                                }
                                  }}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="Copy tracking ID"
                                >
                                  {copiedTrackingId === report.tracking_id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>
                              <Badge variant={report.status === 'new' ? 'default' : 'secondary'}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {decryptedCategories[report.id] ? (
                                <div className="text-sm">
                                  <div className="font-medium">{decryptedCategories[report.id].main}</div>
                                  {decryptedCategories[report.id].sub && (
                                    <div className="text-muted-foreground text-xs">{decryptedCategories[report.id].sub}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>

                            {/* Manual Risk Level Column */}
                            <TableCell>
                              <RiskLevelSelector
                                reportId={report.id}
                                currentLevel={report.manual_risk_level}
                                onUpdate={(level) => updateManualRiskLevel(report.id, level)}
                                isUpdating={updatingRiskLevel === report.id}
                              />
                            </TableCell>

                            {/* AI Triage Column */}
                            <TableCell>
                              {report.ai_risk_level ? (
                                <div className="flex items-center gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 ${
                                          getUrgencyLevel(report.ai_risk_level) === 'HIGH' ? 'bg-red-600 text-white hover:ring-red-400' :
                                          getUrgencyLevel(report.ai_risk_level) === 'MEDIUM' ? 'bg-yellow-500 text-white hover:ring-yellow-400' :
                                          'bg-green-500 text-white hover:ring-green-400'
                                        }`}
                                      >
                                        <span>{getUrgencyLevel(report.ai_risk_level)}</span>
                                        <Eye className="w-3 h-3 opacity-70" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      {renderAITriageDetails(report)}
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Pending...</span>
                              )}
                            </TableCell>

                            <TableCell className="px-2 py-0">
                              <Select
                                value={report.assigned_to || 'unassigned'}
                                onValueChange={(value) => assignReport(report.id, value)}
                              >
                                <SelectTrigger className="w-40 h-6 text-xs">
                                  <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {teamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.first_name && member.last_name 
                                        ? `${member.first_name} ${member.last_name}`
                                        : member.email
                                      }
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground px-2 py-0">
                              {new Date(report.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right px-2 py-0">
                               <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="h-6 text-xs px-2"
                                  onClick={() => handleViewReport(report)}
                                >
                                  {t('viewReport')}
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem 
                                      onClick={async () => {
                                        setUpdatingStatusReportId(report.id);
                                        try {
                                          const { error } = await supabase
                                            .from('reports')
                                            .update({ 
                                              status: 'reviewing',
                                              updated_at: new Date().toISOString()
                                            })
                                            .eq('id', report.id);
                                          
                                          if (error) throw error;
                                          
                                          // Log audit event
                                          if (effectiveOrganizationId) {
                                            await log.info(LogContext.CASE_MANAGEMENT, 'Report status updated', {
                                              reportId: report.id,
                                              userId: user?.id,
                                              userEmail: user?.email,
                                              organizationId: effectiveOrganizationId
                                            });
                                          }
                                          
                                          toast({ title: 'Report marked as Reviewing' });
                                          fetchData();
                                        } catch (error) {
                                          log.error(LogContext.CASE_MANAGEMENT, 'Error updating report status', error as Error, { reportId: report.id });
                                          toast({ 
                                            title: 'Error updating report status',
                                            variant: 'destructive'
                                          });
                                        } finally {
                                          setUpdatingStatusReportId(null);
                                        }
                                      }}
                                      disabled={updatingStatusReportId === report.id}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      {updatingStatusReportId === report.id ? 'Updating...' : 'Mark as Reviewing'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={async () => {
                                        setUpdatingStatusReportId(report.id);
                                        try {
                                          const { error } = await supabase
                                            .from('reports')
                                            .update({ 
                                              status: 'investigating',
                                              updated_at: new Date().toISOString()
                                            })
                                            .eq('id', report.id);
                                          
                                          if (error) throw error;
                                          
                                          // Log audit event
                                          if (organizationId) {
                                            await log.info(LogContext.CASE_MANAGEMENT, 'Report status updated', {
                                              reportId: report.id,
                                              userId: user?.id,
                                              userEmail: user?.email,
                                              organizationId: organizationId
                                            });
                                          }
                                          
                                          toast({ title: 'Report marked as Investigating' });
                                          fetchData();
                                        } catch (error) {
                                          log.error(LogContext.CASE_MANAGEMENT, 'Error updating report status', error as Error, { reportId: report.id });
                                          toast({ 
                                            title: 'Error updating report status',
                                            variant: 'destructive'
                                          });
                                        } finally {
                                          setUpdatingStatusReportId(null);
                                        }
                                      }}
                                      disabled={updatingStatusReportId === report.id}
                                    >
                                      <Search className="h-4 w-4 mr-2" />
                                      {updatingStatusReportId === report.id ? 'Updating...' : 'Mark as Investigating'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={async () => {
                                        setResolvingReportId(report.id);
                                        try {
                                          const { error } = await supabase
                                            .from('reports')
                                            .update({ 
                                              status: 'resolved',
                                              resolved_at: new Date().toISOString()
                                            })
                                            .eq('id', report.id);
                                          
                                          if (error) throw error;
                                          
                                          // Log audit event
                                          if (organizationId) {
                                            await log.info(LogContext.CASE_MANAGEMENT, 'Report resolved', {
                                              reportId: report.id,
                                              userId: user?.id,
                                              userEmail: user?.email,
                                              organizationId: organizationId
                                            });
                                          }
                                          
                                          toast({ title: 'Report marked as resolved' });
                                          fetchData();
                                        } catch (error) {
                                          log.error(LogContext.CASE_MANAGEMENT, 'Error resolving report', error as Error, { reportId: report.id });
                                          toast({ 
                                            title: 'Error resolving report',
                                            variant: 'destructive'
                                          });
                                        } finally {
                                          setResolvingReportId(null);
                                        }
                                      }}
                                      disabled={resolvingReportId === report.id}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {resolvingReportId === report.id ? 'Resolving...' : 'Mark as Resolved'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => exportReportToPDF(report)}
                                      disabled={exportingReportId === report.id}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      {exportingReportId === report.id ? 'Exporting PDF...' : 'Export PDF'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleArchiveReport(report.id)}
                                      disabled={processingReportId === report.id}
                                    >
                                      <Archive className="h-4 w-4 mr-2" />
                                      {processingReportId === report.id ? 'Archiving...' : 'Archive'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setDeleteReportId(report.id);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                    
                    {/* Pagination Footer - Same as audit table */}
                    {totalReports > 0 && (
                      <div className="flex flex-row items-center justify-between px-3 py-2 border-t bg-gray-50 flex-shrink-0 h-10 z-20 bg-white">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Label className="text-xs whitespace-nowrap font-medium">Rows per page:</Label>
                            <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                              <SelectTrigger className="h-7 text-xs w-16 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="text-xs text-gray-600 font-medium">
                            Page {currentPage} of {totalPages}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {startRecord}-{endRecord} of {totalReports}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            className="h-7 w-7 text-xs p-0 border-gray-300"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                              if (pageNum > totalPages) return null;
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === currentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  disabled={loading}
                                  className={`h-7 w-7 text-xs p-0 ${pageNum === currentPage ? '' : 'border-gray-300'}`}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            className="h-7 w-7 text-xs p-0 border-gray-300"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Card View - Allow natural scrolling on mobile */}
                  <div className="md:hidden space-y-4 overflow-y-auto">
                    {paginatedReports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardContent className="p-5 md:p-4 space-y-4 md:space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm md:text-xs text-muted-foreground">{report.tracking_id}</span>
                                <button
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(report.tracking_id);
                                      setCopiedTrackingId(report.tracking_id);
                                      setTimeout(() => setCopiedTrackingId(null), 1000);
                                } catch (error) {
                                  log.error(LogContext.FRONTEND, 'Failed to copy tracking ID', error as Error);
                                }
                                  }}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="Copy tracking ID"
                                >
                                  {copiedTrackingId === report.tracking_id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              <h3 className="font-semibold text-base md:text-sm break-words">{report.title}</h3>
                            </div>
                            <Badge variant={report.status === 'new' ? 'default' : 'secondary'} className="shrink-0">
                              {report.status}
                            </Badge>
                          </div>
                          
                          {decryptedCategories[report.id] ? (
                            <div className="text-base md:text-sm">
                              <div className="font-medium">{decryptedCategories[report.id].main}</div>
                              {decryptedCategories[report.id].sub && (
                                <div className="text-muted-foreground text-sm md:text-xs">{decryptedCategories[report.id].sub}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-base md:text-sm text-muted-foreground">-</span>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <RiskLevelSelector
                              reportId={report.id}
                              currentLevel={report.manual_risk_level}
                              onUpdate={(level) => updateManualRiskLevel(report.id, level)}
                              isUpdating={updatingRiskLevel === report.id}
                            />
                            {report.ai_risk_level && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                                (() => {
                                  const urgency = getUrgencyLevel(report.ai_risk_level);
                                  return urgency === 'HIGH' ? 'bg-red-100 text-red-800' :
                                         urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                         'bg-green-100 text-green-800';
                                })()
                              }`}>
                                <span>{t('ai.triage')}: {getUrgencyLevel(report.ai_risk_level)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm md:text-xs text-muted-foreground">
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                            <Select
                              value={report.assigned_to || 'unassigned'}
                              onValueChange={(value) => assignReport(report.id, value)}
                            >
                              <SelectTrigger className="h-7 text-xs w-32">
                                <SelectValue placeholder="Assign..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {teamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.first_name && member.last_name 
                                      ? `${member.first_name} ${member.last_name}`
                                      : member.email
                                    }
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleViewReport(report)}
                              className="flex-1"
                            >
                              {t('viewReport')}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={async () => {
                                    setUpdatingStatusReportId(report.id);
                                    try {
                                      const { error } = await supabase
                                        .from('reports')
                                        .update({ 
                                          status: 'reviewing',
                                          updated_at: new Date().toISOString()
                                        })
                                        .eq('id', report.id);
                                      if (error) throw error;
                                      if (effectiveOrganizationId) {
                                        await log.info(LogContext.CASE_MANAGEMENT, 'Report status updated', {
                                          reportId: report.id,
                                          userId: user?.id,
                                          userEmail: user?.email,
                                          organizationId: effectiveOrganizationId
                                        });
                                      }
                                      toast({ title: 'Report marked as Reviewing' });
                                      fetchData();
                                    } catch (error) {
                                      console.error('Error updating report status:', error);
                                      toast({ 
                                        title: 'Error updating report status',
                                        variant: 'destructive'
                                      });
                                    } finally {
                                      setUpdatingStatusReportId(null);
                                    }
                                  }}
                                  disabled={updatingStatusReportId === report.id}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  {updatingStatusReportId === report.id ? 'Updating...' : 'Mark as Reviewing'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={async () => {
                                    setUpdatingStatusReportId(report.id);
                                    try {
                                      const { error } = await supabase
                                        .from('reports')
                                        .update({ 
                                          status: 'investigating',
                                          updated_at: new Date().toISOString()
                                        })
                                        .eq('id', report.id);
                                      if (error) throw error;
                                      if (organizationId) {
                                        await log.info(LogContext.CASE_MANAGEMENT, 'Report status updated', {
                                          reportId: report.id,
                                          userId: user?.id,
                                          userEmail: user?.email,
                                          organizationId: organizationId
                                        });
                                      }
                                      toast({ title: 'Report marked as Investigating' });
                                      fetchData();
                                    } catch (error) {
                                      console.error('Error updating report status:', error);
                                      toast({ 
                                        title: 'Error updating report status',
                                        variant: 'destructive'
                                      });
                                    } finally {
                                      setUpdatingStatusReportId(null);
                                    }
                                  }}
                                  disabled={updatingStatusReportId === report.id}
                                >
                                  <Search className="h-4 w-4 mr-2" />
                                  {updatingStatusReportId === report.id ? 'Updating...' : 'Mark as Investigating'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={async () => {
                                    setResolvingReportId(report.id);
                                    try {
                                      const { error } = await supabase
                                        .from('reports')
                                        .update({ 
                                          status: 'resolved',
                                          resolved_at: new Date().toISOString()
                                        })
                                        .eq('id', report.id);
                                      if (error) throw error;
                                      if (organizationId) {
                                        await log.info(LogContext.CASE_MANAGEMENT, 'Report resolved', {
                                          reportId: report.id,
                                          userId: user?.id,
                                          userEmail: user?.email,
                                          organizationId: organizationId
                                        });
                                      }
                                      toast({ title: 'Report marked as resolved' });
                                      fetchData();
                                    } catch (error) {
                                      log.error(LogContext.CASE_MANAGEMENT, 'Error resolving report', error as Error, { reportId: report.id });
                                      toast({ 
                                        title: 'Error resolving report',
                                        variant: 'destructive'
                                      });
                                    } finally {
                                      setResolvingReportId(null);
                                    }
                                  }}
                                  disabled={resolvingReportId === report.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {resolvingReportId === report.id ? 'Resolving...' : 'Mark as Resolved'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => exportReportToPDF(report)}
                                  disabled={exportingReportId === report.id}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  {exportingReportId === report.id ? 'Exporting PDF...' : 'Export PDF'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleArchiveReport(report.id)}
                                  disabled={processingReportId === report.id}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  {processingReportId === report.id ? 'Archiving...' : 'Archive'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteReportId(report.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

            {/* LOCKED: Archived Reports Tab - Must match active tab structure exactly */}
            <TabsContent value="archived" className="flex flex-col overflow-hidden min-h-0">
              {/* LOCKED: Card uses flex-1 to fill remaining space - DO NOT CHANGE to fixed height */}
              <Card className="md:border md:shadow-sm border-0 shadow-none flex flex-col flex-1 overflow-hidden min-h-0" data-dashboard-card-archived>
                <CardContent className="p-0 sm:p-4 flex-1 flex flex-col overflow-hidden min-h-0 pb-4">
              {totalArchived === 0 ? (
                <div className="text-center py-8 text-muted-foreground px-6">
                  {isOrgAdmin ? (
                    "No archived reports"
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg font-medium text-gray-700">No Archived Reports Assigned</div>
                      <div className="text-sm text-gray-500">
                        Archived reports that are assigned to you by your administrator will appear here
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View - Uses flex-1 to fill remaining space */}
                  <div className="hidden md:block flex-1 overflow-hidden flex flex-col min-h-0" data-dashboard-table-archived>
                    {/* Scrollable table body */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0" style={{ maxHeight: 'calc(100% - 40px)' }}>
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-2 py-1 text-xs">Tracking ID</TableHead>
                            <TableHead className="px-2 py-1 text-xs">Title</TableHead>
                            <TableHead className="px-2 py-1 text-xs">Status</TableHead>
                            <TableHead className="px-2 py-1 text-xs">Category</TableHead>
                            <TableHead className="px-2 py-1 text-xs">Archived Date</TableHead>
                            <TableHead className="text-right px-2 py-1 text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {/* LOCKED: Row height is 15px - matches active table - DO NOT CHANGE */}
                        {paginatedArchivedReports.map((report) => (
                            <TableRow key={report.id} style={{ height: '15px' }}>
                              <TableCell className="font-mono text-xs px-2 py-0">
                                <div className="flex items-center gap-2">
                                  <span>{report.tracking_id}</span>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await navigator.clipboard.writeText(report.tracking_id);
                                        setCopiedTrackingId(report.tracking_id);
                                        setTimeout(() => setCopiedTrackingId(null), 1000);
                                  } catch (error) {
                                    log.error(LogContext.FRONTEND, 'Failed to copy tracking ID', error as Error);
                                  }
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy tracking ID"
                                  >
                                    {copiedTrackingId === report.tracking_id ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </TableCell>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{report.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {decryptedCategories[report.id] ? (
                                <div className="text-sm">
                                  <div className="font-medium">{decryptedCategories[report.id].main}</div>
                                  {decryptedCategories[report.id].sub && (
                                    <div className="text-muted-foreground text-xs">{decryptedCategories[report.id].sub}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground px-2 py-0">
                              {new Date(report.archived_at || report.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right px-2 py-0">
                               <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="h-6 text-xs px-2"
                                  onClick={() => handleViewReport(report)}
                                >
                                  {t('viewReport')}
                                </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem 
                                        onClick={() => handleUnarchiveReport(report.id)}
                                        disabled={processingReportId === report.id}
                                      >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        {processingReportId === report.id ? 'Unarchiving...' : 'Unarchive'}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination Footer - Same as audit table */}
                    {totalArchived > 0 && (
                      <div className="flex flex-row items-center justify-between px-3 py-2 border-t bg-gray-50 flex-shrink-0 h-10 z-20 bg-white">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Label className="text-xs whitespace-nowrap font-medium">Rows per page:</Label>
                            <Select value={archivedPageSize.toString()} onValueChange={(value) => handleArchivedPageSizeChange(Number(value))}>
                              <SelectTrigger className="h-7 text-xs w-16 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="text-xs text-gray-600 font-medium">
                            Page {archivedCurrentPage} of {totalArchivedPages}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {archivedStartRecord}-{archivedEndRecord} of {totalArchived}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchivedPageChange(archivedCurrentPage - 1)}
                            disabled={archivedCurrentPage === 1 || loading}
                            className="h-7 w-7 text-xs p-0 border-gray-300"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: Math.min(5, totalArchivedPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(totalArchivedPages - 4, archivedCurrentPage - 2)) + i;
                              if (pageNum > totalArchivedPages) return null;
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === archivedCurrentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleArchivedPageChange(pageNum)}
                                  disabled={loading}
                                  className={`h-7 w-7 text-xs p-0 ${pageNum === archivedCurrentPage ? '' : 'border-gray-300'}`}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchivedPageChange(archivedCurrentPage + 1)}
                            disabled={archivedCurrentPage === totalArchivedPages || loading}
                            className="h-7 w-7 text-xs p-0 border-gray-300"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Card View - Allow natural scrolling on mobile */}
                  <div className="md:hidden space-y-4 overflow-y-auto">
                    {paginatedArchivedReports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardContent className="p-5 md:p-4 space-y-4 md:space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm md:text-xs text-muted-foreground">{report.tracking_id}</span>
                                <button
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(report.tracking_id);
                                      setCopiedTrackingId(report.tracking_id);
                                      setTimeout(() => setCopiedTrackingId(null), 1000);
                                } catch (error) {
                                  log.error(LogContext.FRONTEND, 'Failed to copy tracking ID', error as Error);
                                }
                                  }}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="Copy tracking ID"
                                >
                                  {copiedTrackingId === report.tracking_id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              <h3 className="font-semibold text-base md:text-sm break-words">{report.title}</h3>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {report.status}
                            </Badge>
                          </div>
                          
                          {decryptedCategories[report.id] ? (
                            <div className="text-base md:text-sm">
                              <div className="font-medium">{decryptedCategories[report.id].main}</div>
                              {decryptedCategories[report.id].sub && (
                                <div className="text-muted-foreground text-sm md:text-xs">{decryptedCategories[report.id].sub}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-base md:text-sm text-muted-foreground">-</span>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <RiskLevelSelector
                              reportId={report.id}
                              currentLevel={report.manual_risk_level}
                              onUpdate={(level) => updateManualRiskLevel(report.id, level)}
                              isUpdating={updatingRiskLevel === report.id}
                            />
                            {report.ai_risk_level && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                                (() => {
                                  const urgency = getUrgencyLevel(report.ai_risk_level);
                                  return urgency === 'HIGH' ? 'bg-red-100 text-red-800' :
                                         urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                         'bg-green-100 text-green-800';
                                })()
                              }`}>
                                <span>{t('ai.triage')}: {getUrgencyLevel(report.ai_risk_level)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm md:text-xs text-muted-foreground">
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                            <Select
                              value={report.assigned_to || 'unassigned'}
                              onValueChange={(value) => assignReport(report.id, value)}
                            >
                              <SelectTrigger className="h-7 text-xs w-32">
                                <SelectValue placeholder="Assign..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {teamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.first_name && member.last_name 
                                      ? `${member.first_name} ${member.last_name}`
                                      : member.email
                                    }
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleViewReport(report)}
                              className="flex-1"
                            >
                              {t('viewReport')}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={() => handleUnarchiveReport(report.id)}
                                  disabled={processingReportId === report.id}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  {processingReportId === report.id ? 'Unarchiving...' : 'Unarchive'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeleteReportId(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteReportId ? (() => {
                const reportToDelete = reports.find(r => r.id === deleteReportId) || 
                                      archivedReports.find(r => r.id === deleteReportId);
                return reportToDelete ? (
                  <>
                    This action cannot be undone. This will permanently delete the report 
                    "{reportToDelete.title}" (Tracking ID: {reportToDelete.tracking_id}) and all associated messages, attachments, and data.
                  </>
                ) : (
                  'This action cannot be undone. This will permanently delete the report and all associated data.'
                );
              })() : 'This action cannot be undone. This will permanently delete the report and all associated data.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteReportId(null);
              setIsDeleteDialogOpen(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (!deleteReportId) return;
                
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session?.access_token) {
                    throw new Error('No valid session token');
                  }
                  const response = await fetch(
                    `https://cxmuzperkittvibslnff.supabase.co/functions/v1/soft-delete-report`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                      },
                      body: JSON.stringify({ reportId: deleteReportId })
                    }
                  );
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete report');
                  }
                  toast({ title: '✅ Report deleted successfully' });
                  setDeleteReportId(null);
                  setIsDeleteDialogOpen(false);
                  fetchData();
                } catch (error: any) {
                  log.error(LogContext.CASE_MANAGEMENT, 'Error deleting report', error as Error, { reportId: deleteReportId });
                  toast({ 
                    title: '❌ Error deleting report',
                    description: error.message || 'Failed to delete report. Please try again.',
                    variant: 'destructive'
                  });
                  setDeleteReportId(null);
                  setIsDeleteDialogOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Triage Mobile Modal */}
      <Sheet open={!!aiTriageReportId} onOpenChange={(open) => !open && setAiTriageReportId(null)}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('ai.caseTriage')}</SheetTitle>
            <SheetDescription>
              {aiTriageReportId && reports.find(r => r.id === aiTriageReportId)?.tracking_id}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {aiTriageReportId && (() => {
              const report = reports.find(r => r.id === aiTriageReportId);
              return report ? renderAITriageDetails(report) : null;
            })()}
          </div>
        </SheetContent>
      </Sheet>

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] sm:max-w-lg md:!max-w-[800px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>
                  Tracking ID: {selectedReport.tracking_id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 min-w-0">
                <ReportContentDisplay 
                  encryptedContent={selectedReport.encrypted_content}
                  title={selectedReport.title}
                  status={selectedReport.status}
                  trackingId={selectedReport.tracking_id}
                  reportType={selectedReport.report_type}
                  createdAt={selectedReport.created_at}
                  priority={selectedReport.priority}
                  submittedByEmail={selectedReport.submitted_by_email}
                  reportId={selectedReport.id}
                  incidentDate={selectedReport.incident_date}
                  location={selectedReport.location}
                  witnesses={selectedReport.witnesses}
                  previousReports={selectedReport.previous_reports}
                  additionalNotes={selectedReport.additional_notes}
                />
                <ReportAttachments reportId={selectedReport.id} />
                <ReportMessaging 
                  report={{
                    ...selectedReport,
                    organizations: { name: '' }
                  }} 
                  onClose={() => setIsReportDialogOpen(false)}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardView;
