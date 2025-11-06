import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { log, LogContext } from '@/utils/logger';
import { FileText, Eye, Archive, Trash2, RotateCcw, MoreVertical, XCircle, ChevronUp, ChevronDown, CheckCircle, Search, Download, FileSpreadsheet, Bot, Zap } from 'lucide-react';
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
import { createBrandedPDF, addPDFSection, addPDFField, downloadPDF, exportToCSV, formatExportDate, getStatusColor, addPDFTable } from '@/utils/export-utils';
import { decryptReport } from '@/utils/encryption';

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
  status: 'new' | 'reviewing' | 'investigating' | 'resolved' | 'closed' | 'archived' | 'deleted';
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
  const { isOrgAdmin, loading: rolesLoading } = useUserRoles();
  const { customDomain, organizationId } = useCustomDomain();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Get organization ID from multiple sources
  const effectiveOrganizationId = organizationId || organization?.id;
  
  // Debug: Log organization ID sources
  console.log('DashboardView: organizationId from useCustomDomain:', organizationId);
  console.log('DashboardView: organization?.id from useOrganization:', organization?.id);
  console.log('DashboardView: effectiveOrganizationId:', effectiveOrganizationId);
  console.log('DashboardView: Component loaded with latest code!');
  
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
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    console.log('DashboardView useEffect - user:', !!user, 'rolesLoading:', rolesLoading, 'isOrgAdmin:', isOrgAdmin);
    if (user && !rolesLoading) {
      console.log('DashboardView - Roles loaded, fetching data with isOrgAdmin:', isOrgAdmin);
      fetchData();
    } else if (user && rolesLoading) {
      console.log('DashboardView - Waiting for roles to load...');
    }
  }, [user, rolesLoading, isOrgAdmin]);

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
        let reportsQuery = supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, ai_risk_score, ai_risk_level, ai_likelihood_score, ai_impact_score, ai_risk_assessment, ai_assessed_at, manual_risk_level')
          .eq('organization_id', profile.organization_id)
          .not('status', 'in', '(archived,deleted)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        // Add filtering for team members
        console.log('DashboardView - isOrgAdmin:', isOrgAdmin, 'rolesLoading:', rolesLoading);
        if (isOrgAdmin === false && rolesLoading === false) {
          console.log('DashboardView - Filtering reports for team member:', user?.id);
          reportsQuery = reportsQuery.eq('assigned_to', user?.id);
        } else {
          console.log('DashboardView - Showing all reports for org admin (isOrgAdmin:', isOrgAdmin, 'rolesLoading:', rolesLoading, ')');
        }

        const { data: reportsWithAI, error: reportsError } = await reportsQuery;

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

        // Add filtering for archived reports
        if (isOrgAdmin === false && rolesLoading === false) {
          console.log('DashboardView - Filtering archived reports for team member:', user?.id);
          // Note: We can't modify the query after it's executed, so we'll filter the results
          if (archivedWithAI) {
            archivedData = archivedWithAI.filter(report => report.assigned_to === user?.id);
          }
        } else {
          archivedData = archivedWithAI;
        }

      } catch (aiError) {
        console.log('AI fields not available, falling back to basic query:', aiError);
        
        // Fallback to basic query without AI fields
        let reportsBasicQuery = supabase
          .from('reports')
          .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email, tags, assigned_to, manual_risk_level')
          .eq('organization_id', profile.organization_id)
          .not('status', 'in', '(archived,deleted)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(20);

        // Add filtering for team members in fallback query
        if (isOrgAdmin === false && rolesLoading === false) {
          console.log('DashboardView - Fallback: Filtering reports for team member:', user?.id);
          reportsBasicQuery = reportsBasicQuery.eq('assigned_to', user?.id);
        }

        const { data: reportsBasic, error: reportsBasicError } = await reportsBasicQuery;

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
        
        // Add filtering for archived reports in fallback
        if (isOrgAdmin === false && rolesLoading === false) {
          console.log('DashboardView - Fallback: Filtering archived reports for team member:', user?.id);
          archivedData = archivedBasic?.filter(report => report.assigned_to === user?.id) || [];
        } else {
          archivedData = archivedBasic;
        }
      }

      console.log('Reports fetched:', reportsData);
      console.log('Archived reports fetched:', archivedData);
      setReports(reportsData || []);
      setArchivedReports(archivedData || []);

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
        console.error('Error fetching team members:', teamError);
      } else {
        setTeamMembers(teamData || []);
      }
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
      if (report && effectiveOrganizationId) {
        await log.info(LogContext.CASE_MANAGEMENT, 'Report assignment updated', {
          reportId: reportId,
          userId: user?.id,
          userEmail: user?.email,
          organizationId: effectiveOrganizationId
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
      console.error('Error assigning report:', error);
      toast({
        title: "Error",
        description: "Failed to assign report",
        variant: "destructive",
      });
    }
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
    
    // Automatically change status from "new" to "new" when first viewed
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
        console.log('DashboardView: organizationId from useCustomDomain:', organizationId);
        console.log('DashboardView: effectiveOrganizationId:', effectiveOrganizationId);
        if (effectiveOrganizationId) {
          await log.info(LogContext.CASE_MANAGEMENT, 'Report status updated', {
            reportId: report.id,
            userId: user?.id,
            userEmail: user?.email,
            organizationId: effectiveOrganizationId
          });
        } else {
          console.log('DashboardView: effectiveOrganizationId is null/undefined, cannot log audit event');
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
    }
  };

  const handleUnarchiveReport = async (reportId: string) => {
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
    }
  };

  const assessRisk = async (reportId: string) => {
    setIsAssessingRisk(reportId);
    try {
      console.log('Starting AI risk assessment for report:', reportId);
      
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
      const { decryptReport } = await import('@/utils/encryption');
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

  // Export individual report as PDF
  const exportReportToPDF = async (report: Report) => {
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
      const { decryptReport } = await import('@/utils/encryption');
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

      // Log export action
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
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
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
      console.error('Error generating CSV:', error);
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
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6">
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

      <div className="space-y-4">
        {/* Title and Subtitle */}
        <div>
          <h2 className="text-2xl font-bold">{t('reportsOverview')}</h2>
          <p className="text-muted-foreground break-words hyphens-auto">{t('manageAndReviewReports')}</p>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          {/* Tabs, Search, and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <TabsList>
              <TabsTrigger value="active">{t('activeReports')} ({reports.length})</TabsTrigger>
              <TabsTrigger value="archived">{t('archived')} ({archivedReports.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
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
          <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
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
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto max-w-full">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('trackingId')}</TableHead>
                          <TableHead>{t('title')}</TableHead>
                          <TableHead>{t('status')}</TableHead>
                          <TableHead>{t('category')}</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>AI Triage</TableHead>
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
                              <Badge variant={report.status === 'new' ? 'default' : 'secondary'}>
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
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 ${
                                          report.ai_risk_level === 'Critical' ? 'bg-red-600 text-white hover:ring-red-400' :
                                          report.ai_risk_level === 'High' ? 'bg-orange-500 text-white hover:ring-orange-400' :
                                          report.ai_risk_level === 'Medium' ? 'bg-yellow-500 text-white hover:ring-yellow-400' :
                                          'bg-green-500 text-white hover:ring-green-400'
                                        }`}
                                      >
                                        <Bot className="w-3 h-3" />
                                        <span>{report.ai_risk_level} ({report.ai_risk_score}/25)</span>
                                        <Eye className="w-3 h-3 opacity-70" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Zap className="w-4 h-4 text-primary" />
                                          <h4 className="font-semibold text-sm">AI Risk Assessment</h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>
                                            <div className="text-xs text-muted-foreground">Risk Score</div>
                                            <div className="font-bold">{report.ai_risk_score}/25</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground">Risk Level</div>
                                            <div className="font-bold">{report.ai_risk_level}</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground">Likelihood</div>
                                            <div className="font-bold">{report.ai_likelihood_score}/5</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground">Impact</div>
                                            <div className="font-bold">{report.ai_impact_score}/5</div>
                                          </div>
                                        </div>

                                        {report.ai_assessed_at && (
                                          <div className="text-xs text-muted-foreground pt-2 border-t">
                                            Assessed: {new Date(report.ai_assessed_at).toLocaleString()}
                                          </div>
                                        )}

                                        {report.ai_risk_assessment?.priority_recommendation && (
                                          <div className="text-xs pt-2 border-t">
                                            <div className="font-medium mb-1">Recommended Priority:</div>
                                            <Badge variant="outline" className="text-xs">
                                              {report.ai_risk_assessment.priority_recommendation}
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Pending...</span>
                              )}
                            </TableCell>

                            <TableCell>
                              <Select
                                value={report.assigned_to || 'unassigned'}
                                onValueChange={(value) => assignReport(report.id, value)}
                              >
                                <SelectTrigger className="w-40 h-8 text-xs">
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
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem 
                                      onClick={async () => {
                                        console.log('Dropdown clicked: Mark as Reviewing');
                                        try {
                                          console.log('DashboardView: Starting status change to reviewing for report:', report.id);
                                          const { error } = await supabase
                                            .from('reports')
                                            .update({ 
                                              status: 'reviewing',
                                              updated_at: new Date().toISOString()
                                            })
                                            .eq('id', report.id);
                                          
                                          if (error) throw error;
                                          
                                          // Log audit event
                                          console.log('DashboardView: Dropdown action - organizationId:', organizationId);
                                          console.log('DashboardView: Dropdown action - effectiveOrganizationId:', effectiveOrganizationId);
                                          console.log('DashboardView: User ID:', user?.id);
                                          console.log('DashboardView: User email:', user?.email);
                                          console.log('DashboardView: User metadata:', user?.user_metadata);
                                          console.log('DashboardView: About to check if effectiveOrganizationId exists...');
                                          if (effectiveOrganizationId) {
                                            console.log('DashboardView: effectiveOrganizationId is valid, calling log.info...');
                                            await log.info(LogContext.CASE_MANAGEMENT, 'Report status updated', {
                                              reportId: report.id,
                                              userId: user?.id,
                                              userEmail: user?.email,
                                              organizationId: effectiveOrganizationId
                                            });
                                            console.log('DashboardView: Audit event logged successfully');
                                            // Small delay to ensure database transaction is committed
                                            await new Promise(resolve => setTimeout(resolve, 100));
                                          } else {
                                            console.log('DashboardView: effectiveOrganizationId is null/undefined, cannot log audit event');
                                            console.log('DashboardView: organizationId from useCustomDomain:', organizationId);
                                            console.log('DashboardView: user?.user_metadata?.organization_id:', user?.user_metadata?.organization_id);
                                          }
                                          
                                          toast({ title: 'Report marked as Reviewing' });
                                          fetchData();
                                        } catch (error) {
                                          console.error('Error updating report status:', error);
                                          toast({ 
                                            title: 'Error updating report status',
                                            variant: 'destructive'
                                          });
                                        }
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Mark as Reviewing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={async () => {
                                        try {
                                          console.log('DashboardView: Starting status change to investigating for report:', report.id);
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
                                          console.error('Error updating report status:', error);
                                          toast({ 
                                            title: 'Error updating report status',
                                            variant: 'destructive'
                                          });
                                        }
                                      }}
                                    >
                                      <Search className="h-4 w-4 mr-2" />
                                      Mark as Investigating
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={async () => {
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
                                          console.error('Error resolving report:', error);
                                          toast({ 
                                            title: 'Error resolving report',
                                            variant: 'destructive'
                                          });
                                        }
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark as Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportReportToPDF(report)}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Export PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleArchiveReport(report.id)}>
                                      <Archive className="h-4 w-4 mr-2" />
                                      Archive
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
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredReports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-xs text-muted-foreground mb-1">{report.tracking_id}</div>
                              <h3 className="font-semibold text-sm break-words">{report.title}</h3>
                            </div>
                            <Badge variant={report.status === 'new' ? 'default' : 'secondary'} className="shrink-0">
                              {report.status}
                            </Badge>
                          </div>
                          
                          {report.tags && report.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {report.tags.slice(0, 3).map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {report.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{report.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <RiskLevelSelector
                              reportId={report.id}
                              currentLevel={report.manual_risk_level}
                              onUpdate={(level) => updateManualRiskLevel(report.id, level)}
                              isUpdating={updatingRiskLevel === report.id}
                            />
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
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                                    }
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark as Reviewing
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={async () => {
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
                                    }
                                  }}
                                >
                                  <Search className="h-4 w-4 mr-2" />
                                  Mark as Investigating
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={async () => {
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
                                      console.error('Error resolving report:', error);
                                      toast({ 
                                        title: 'Error resolving report',
                                        variant: 'destructive'
                                      });
                                    }
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportReportToPDF(report)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleArchiveReport(report.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
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

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Archived Reports</CardTitle>
              <CardDescription>Closed and archived reports</CardDescription>
            </CardHeader>
            <CardContent>
              {archivedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
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
                  console.error('Error deleting report:', error);
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

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
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
