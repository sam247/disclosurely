import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, Archive, Trash2, RotateCcw, MoreVertical, XCircle, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReportMessaging from '@/components/ReportMessaging';
import ReportContentDisplay from '@/components/ReportContentDisplay';
import ReportAttachments from '@/components/ReportAttachments';
import LinkGenerator from '@/components/LinkGenerator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { useTranslation } from 'react-i18next';
import PatternDetection from './PatternDetection';

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
          className={`h-8 px-2 text-xs ${currentLevel ? getRiskLevelColor(currentLevel) : 'bg-gray-100 text-gray-600'}`}
          disabled={isUpdating}
        >
          {currentLevel ? `${getRiskLevelText(currentLevel)} (${currentLevel}/5)` : 'Set Risk'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 mb-2">Select Risk Level</div>
          {[
            { level: 1, text: 'Critical', desc: 'Immediate danger/serious violation' },
            { level: 2, text: 'High', desc: 'Significant impact' },
            { level: 3, text: 'Medium', desc: 'Standard concern' },
            { level: 4, text: 'Low', desc: 'Minor issue' },
            { level: 5, text: 'Info', desc: 'General feedback' }
          ].map(({ level, text, desc }) => (
            <Button
              key={level}
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-xs ${currentLevel === level ? 'bg-primary/10' : ''}`}
              onClick={() => onUpdate(level)}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${getRiskLevelColor(level).split(' ')[0]}`} />
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
  status: 'new' | 'live' | 'in_review' | 'investigating' | 'resolved' | 'closed' | 'archived' | 'deleted';
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
}

const DashboardView = () => {
  const { user } = useAuth();
  const { customDomain, organizationId } = useCustomDomain();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [archivedReports, setArchivedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'created_at' | 'title' | 'tracking_id' | 'ai_risk_score'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [reportCategories, setReportCategories] = useState<Record<string, string>>({});
  const [isAssessingRisk, setIsAssessingRisk] = useState<string | null>(null);
  const [updatingRiskLevel, setUpdatingRiskLevel] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        console.log('No organization_id found for user:', user.id);
        setLoading(false);
        return;
      }

      console.log('Fetching reports for organization:', profile.organization_id);

      // First, let's check what reports exist in the database
      const { data: allReports, error: allReportsError } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, organization_id')
        .eq('organization_id', profile.organization_id);
      
      console.log('All reports for this organization:', allReports);
      console.log('All reports error:', allReportsError);

      // First, try to fetch with AI fields, fallback to basic fields if they don't exist
      let reportsData, archivedData;
      
      try {
        // Try with AI fields first
        const { data: reportsWithAI, error: reportsError } = await supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, ai_risk_score, ai_risk_level, ai_likelihood_score, ai_impact_score, ai_risk_assessment, ai_assessed_at, manual_risk_level')
          .eq('organization_id', profile.organization_id)
          .not('status', 'in', '(archived,closed,deleted)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (reportsError) {
          console.log('AI fields query failed, falling back to basic query:', reportsError);
          throw reportsError;
        }
        reportsData = reportsWithAI;
        console.log('Successfully fetched reports with AI fields:', reportsData);

        const { data: archivedWithAI, error: archivedError } = await supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to')
          .eq('organization_id', profile.organization_id)
          .eq('status', 'archived')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (archivedError) throw archivedError;
        archivedData = archivedWithAI;

      } catch (aiError) {
        console.log('AI fields not available, falling back to basic query:', aiError);
        
        // Fallback to basic query without AI fields
        const { data: reportsBasic, error: reportsBasicError } = await supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, manual_risk_level')
          .eq('organization_id', profile.organization_id)
          .not('status', 'in', '(archived,closed,deleted)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (reportsBasicError) throw reportsBasicError;
        reportsData = reportsBasic;

        const { data: archivedBasic, error: archivedBasicError } = await supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to')
          .eq('organization_id', profile.organization_id)
          .eq('status', 'archived')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (archivedBasicError) throw archivedBasicError;
        archivedData = archivedBasic;
      }

      console.log('Reports fetched:', reportsData);
      console.log('Archived reports fetched:', archivedData);
      setReports(reportsData || []);
      setArchivedReports(archivedData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load reports. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
    
    // Automatically change status from "new" to "live" when first viewed
    if (report.status === 'new') {
      try {
        const { error } = await supabase
          .from('reports')
          .update({ 
            status: 'live',
            first_read_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', report.id);

        if (error) throw error;

        // Update local state
        setReports(prevReports => 
          prevReports.map(r => 
            r.id === report.id 
              ? { ...r, status: 'live' as const, first_read_at: new Date().toISOString() }
              : r
          )
        );
      } catch (error) {
        console.error('Error updating report status:', error);
      }
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

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
    }
  };

  const handleUnarchiveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'live',
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
    }
  };

  const assessRisk = async (reportId: string) => {
    setIsAssessingRisk(reportId);
    try {
      console.log('Starting AI risk assessment for report:', reportId);
      
      // Get the report data
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      // Get user's organization ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) throw new Error('User organization not found');

      // Decrypt the report content
      const { decryptReport } = await import('@/utils/encryption');
      const decryptedContent = decryptReport(report.encrypted_content, profile.organization_id);
      
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

      console.log('Calling AI risk assessment function...');
      
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
        console.error('AI risk assessment error:', error);
        throw error;
      }

      console.log('AI risk assessment response:', data);

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
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('AI risk assessment completed successfully');

      toast({
        title: "Risk Assessment Complete",
        description: `Risk Score: ${data.riskAssessment.risk_score} (${data.riskAssessment.risk_level})`,
      });

      // Refresh the data
      fetchData();
    } catch (error) {
      console.error('Error assessing risk:', error);
      toast({
        title: "Error",
        description: `Failed to assess risk: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsAssessingRisk(null);
    }
  };

  const updateManualRiskLevel = async (reportId: string, riskLevel: number) => {
    setUpdatingRiskLevel(reportId);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          manual_risk_level: riskLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

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
      console.error('Error updating risk level:', error);
      toast({
        title: "Error",
        description: "Failed to update risk level. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRiskLevel(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('activeReports')}</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <Archive className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('archivedReports')}</p>
                <p className="text-2xl font-bold">{archivedReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('quickReport')}</p>
                <p className="text-2xl font-bold">{t('active')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Detection */}
      <PatternDetection />

      <div>
        <h2 className="text-2xl font-bold">{t('reportsOverview')}</h2>
        <p className="text-muted-foreground break-words hyphens-auto">{t('manageAndReviewReports')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder={t('searchReports')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="new">{t('newIssue')}</SelectItem>
            <SelectItem value="live">{t('live')}</SelectItem>
            <SelectItem value="in_review">{t('inReview')}</SelectItem>
            <SelectItem value="investigating">{t('investigating')}</SelectItem>
            <SelectItem value="resolved">{t('resolved')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">{t('activeReports')} ({reports.length})</TabsTrigger>
          <TabsTrigger value="archived">{t('archived')} ({archivedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noReportsFound')}
                </div>
              ) : (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('trackingId')}</TableHead>
                      <TableHead>{t('title')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>{t('assignedTo')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-sm">{report.tracking_id}</TableCell>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'live' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.tags && report.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {report.tags.slice(0, 2).map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {report.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{report.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Manual Risk Level */}
                            <RiskLevelSelector
                              reportId={report.id}
                              currentLevel={report.manual_risk_level}
                              onUpdate={(level) => updateManualRiskLevel(report.id, level)}
                              isUpdating={updatingRiskLevel === report.id}
                            />
                            
                            {/* AI Risk Level (if available) */}
                            {report.ai_risk_level && (
                              <Badge 
                                variant={
                                  report.ai_risk_level === 'Critical' ? 'destructive' :
                                  report.ai_risk_level === 'High' ? 'destructive' :
                                  report.ai_risk_level === 'Medium' ? 'secondary' :
                                  'outline'
                                }
                                className="text-xs"
                              >
                                AI: {report.ai_risk_level}
                              </Badge>
                            )}
                            
                            {/* Legacy Priority (if no manual risk level) */}
                            {!report.manual_risk_level && report.priority && (
                              <Badge 
                                variant={
                                  report.priority >= 4 ? 'destructive' :
                                  report.priority >= 3 ? 'secondary' :
                                  'outline'
                                }
                                className="text-xs"
                              >
                                Legacy: {report.priority >= 4 ? 'High' : 
                                 report.priority >= 3 ? 'Medium' : 'Low'} ({report.priority}/5)
                              </Badge>
                            )}
                            
                            {/* Assess Button (if no risk level set) */}
                            {!report.manual_risk_level && !report.ai_risk_level && !report.priority && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => assessRisk(report.id)}
                                className="text-xs"
                                disabled={isAssessingRisk === report.id}
                              >
                                {isAssessingRisk === report.id ? 'Assessing...' : 'Assess'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.assigned_to ? (
                            <span className="text-sm">{t('assigned')}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">{t('unassigned')}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleViewReport(report)}
                            >
                              {t('viewReport')}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem 
                                  onClick={async () => {
                                    try {
                                      const { error } = await supabase
                                        .from('reports')
                                        .update({ 
                                          status: 'closed',
                                          closed_at: new Date().toISOString()
                                        })
                                        .eq('id', report.id);
                                      
                                      if (error) throw error;
                                      toast({ title: 'Report closed successfully' });
                                      fetchData();
                                    } catch (error) {
                                      console.error('Error closing report:', error);
                                      toast({ 
                                        title: 'Error closing report',
                                        variant: 'destructive'
                                      });
                                    }
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Close
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleArchiveReport(report.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={async () => {
                                    try {
                                      // Use edge function for soft delete
                                      const { data: { session } } = await supabase.auth.getSession();
                                      
                                      const response = await fetch(
                                        `https://cxmuzperkittvibslnff.supabase.co/functions/v1/soft-delete-report`,
                                        {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${session?.access_token}`
                                          },
                                          body: JSON.stringify({ reportId: report.id })
                                        }
                                      );

                                      if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.error || 'Failed to delete report');
                                      }
                                      
                                      toast({ title: 'Report deleted successfully' });
                                      fetchData();
                                    } catch (error: any) {
                                      console.error('Error deleting report:', error);
                                      toast({ 
                                        title: 'Error deleting report',
                                        description: error.message,
                                        variant: 'destructive'
                                      });
                                    }
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Archived Reports</CardTitle>
              <CardDescription>Closed and archived reports</CardDescription>
            </CardHeader>
            <CardContent>
              {archivedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No archived reports
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Archived Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-sm">{report.tracking_id}</TableCell>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {report.tags && report.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {report.tags.slice(0, 2).map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {report.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{report.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewReport(report)}
                              className="text-primary hover:text-primary"
                            >
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleUnarchiveReport(report.id)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Unarchive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>
                  Tracking ID: {selectedReport.tracking_id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
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
