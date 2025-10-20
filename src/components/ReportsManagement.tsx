import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Eye, 
  UserCheck, 
  MessageSquare, 
  FileText, 
  Filter,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Archive,
  ArchiveRestore,
  Trash2,
  RotateCcw,
  BookOpen,
  Tags
} from 'lucide-react';
import ReportsStatistics from '@/components/ReportsStatistics';
import TagEditor from '@/components/TagEditor';
import { useTranslation } from 'react-i18next';
import { auditLogger } from '@/utils/auditLogger';

type ReportStatus = 'new' | 'reviewing' | 'investigating' | 'resolved' | 'closed' | 'archived' | 'deleted';

interface Report {
  id: string;
  tracking_id: string;
  title: string;
  status: ReportStatus;
  priority: number;
  report_type: string;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  submitted_by_email: string | null;
  tags: string[];
  first_read_at: string | null;
  closed_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

const ReportsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [reportNotes, setReportNotes] = useState<any[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tempTags, setTempTags] = useState<string[]>([]);

  useEffect(() => {
    fetchReports();
    fetchTeamMembers();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) return;

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          profiles:assigned_to (
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', profile.organization_id)
        .filter('deleted_at', showDeleted ? 'not.is' : 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchReportNotes = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('report_notes')
        .select(`
          *,
          profiles:author_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReportNotes(data || []);
    } catch (error) {
      console.error('Error fetching report notes:', error);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Set resolved_at for resolved status
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;
      
      // Log status update to audit trail
      if (report && profile?.organization_id) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'Status changed',
          severity: 'medium',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Report ${report.tracking_id} status changed from ${report.status} to ${newStatus}`,
          description: `Status updated for "${report.title}"`,
          beforeState: { status: report.status },
          afterState: { status: newStatus },
          metadata: {
            report_type: report.report_type,
            priority: report.priority,
          },
          organizationId: profile.organization_id,
        });
      }
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Report status updated successfully",
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'new',
          first_read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .eq('status', 'new');

      if (error) throw error;
      
      // Log mark as read to audit trail
      if (report && profile?.organization_id) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'Marked as read',
          severity: 'low',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Report ${report.tracking_id} marked as read`,
          description: `First read of "${report.title}"`,
          beforeState: { status: 'new' },
          afterState: { status: 'new', first_read_at: new Date().toISOString() },
          organizationId: profile.organization_id,
        });
      }
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Report marked as read",
      });
    } catch (error) {
      console.error('Error marking report as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark report as read",
        variant: "destructive",
      });
    }
  };

  const closeReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      
      // Log close action to audit trail
      if (report && profile?.organization_id) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'Report closed',
          severity: 'medium',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Report ${report.tracking_id} closed`,
          description: `Case "${report.title}" closed`,
          beforeState: { status: report.status },
          afterState: { status: 'closed', closed_at: new Date().toISOString() },
          organizationId: profile.organization_id,
        });
      }
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Report closed successfully",
      });
    } catch (error) {
      console.error('Error closing report:', error);
      toast({
        title: "Error",
        description: "Failed to close report",
        variant: "destructive",
      });
    }
  };

  const archiveReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const profile = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      
      // Log archive action
      if (report && profile.data?.organization_id) {
        await auditLogger.log({
          eventType: 'report.archived',
          category: 'case_management',
          action: 'Report archived',
          severity: 'medium',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Report ${report.tracking_id} archived by ${user?.email}`,
          description: `Report "${report.title}" moved to archive`,
          beforeState: { status: report.status },
          afterState: { status: 'archived' },
          metadata: {
            report_type: report.report_type,
            priority: report.priority,
            tags: report.tags,
          },
          organizationId: profile.data.organization_id,
        });
      }
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Report archived successfully",
      });
    } catch (error) {
      console.error('Error archiving report:', error);
      toast({
        title: "Error",
        description: "Failed to archive report",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const profile = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase.functions.invoke('soft-delete-report', {
        body: { reportId },
      });

      if (error) throw error;
      
      // Log deletion action
      if (report && profile.data?.organization_id) {
        await auditLogger.log({
          eventType: 'report.deleted',
          category: 'case_management',
          action: 'Report soft deleted',
          severity: 'high',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Report ${report.tracking_id} deleted by ${user?.email}`,
          description: `Report "${report.title}" moved to deleted status`,
          beforeState: { status: report.status, deleted_at: null },
          afterState: { status: 'deleted', deleted_at: new Date().toISOString() },
          metadata: {
            report_type: report.report_type,
            priority: report.priority,
            tags: report.tags,
            deletion_reason: 'manual_deletion',
          },
          organizationId: profile.data.organization_id,
        });
      }
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const restoreReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const profile = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'new',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      
      // Log restoration action
      if (report && profile.data?.organization_id) {
        await auditLogger.log({
          eventType: 'report.restored',
          category: 'case_management',
          action: 'Report restored from archive',
          severity: 'medium',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Report ${report.tracking_id} restored by ${user?.email}`,
          description: `Report "${report.title}" restored from ${report.status} status`,
          beforeState: { status: report.status, archived_at: report.archived_at, deleted_at: report.deleted_at },
          afterState: { status: 'new', archived_at: null, deleted_at: null },
          metadata: {
            report_type: report.report_type,
            priority: report.priority,
            tags: report.tags,
            previous_status: report.status,
          },
          organizationId: profile.data.organization_id,
        });
      }
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Report restored successfully",
      });
    } catch (error) {
      console.error('Error restoring report:', error);
      toast({
        title: "Error",
        description: "Failed to restore report",
        variant: "destructive",
      });
    }
  };

  const updateReportTags = async (reportId: string, tags: string[]) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      
      // Log tag update to audit trail
      if (report && profile?.organization_id) {
        await auditLogger.log({
          eventType: 'case.update',
          category: 'case_management',
          action: 'Tags updated',
          severity: 'low',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Tags updated for report ${report.tracking_id}`,
          description: `Tags changed for "${report.title}"`,
          beforeState: { tags: report.tags },
          afterState: { tags },
          organizationId: profile.organization_id,
        });
      }
      
      await fetchReports();
      setEditingTags(false);
      toast({
        title: "Success",
        description: "Tags updated successfully",
      });
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive",
      });
    }
  };

  const assignReport = async (reportId: string, assigneeId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const assignee = teamMembers.find(m => m.id === assigneeId);
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          assigned_to: assigneeId === 'unassigned' ? null : assigneeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      
      // Log assignment to audit trail
      if (report && profile?.organization_id) {
        await auditLogger.log({
          eventType: 'case.assign',
          category: 'case_management',
          action: 'Report assigned',
          severity: 'medium',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `Report ${report.tracking_id} assigned to ${assignee ? `${assignee.first_name} ${assignee.last_name}` : 'unassigned'}`,
          description: `Assignment changed for "${report.title}"`,
          beforeState: { assigned_to: report.assigned_to },
          afterState: { assigned_to: assigneeId === 'unassigned' ? null : assigneeId },
          metadata: {
            assignee_email: assignee?.email,
            assignee_role: assignee?.role,
          },
          organizationId: profile.organization_id,
        });
      }
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Report assigned successfully",
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

  const addNote = async () => {
    if (!selectedReport || !newNote.trim()) return;

    try {
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user?.id).single();
      
      const { error } = await supabase
        .from('report_notes')
        .insert({
          report_id: selectedReport.id,
          author_id: user?.id,
          content: newNote,
        });

      if (error) throw error;
      
      // Log note addition to audit trail
      if (profile?.organization_id) {
        await auditLogger.log({
          eventType: 'case.note_added',
          category: 'case_management',
          action: 'Internal note added',
          severity: 'low',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'report',
          targetId: selectedReport.id,
          targetName: selectedReport.tracking_id,
          summary: `Note added to report ${selectedReport.tracking_id}`,
          description: `Internal note added to "${selectedReport.title}"`,
          metadata: {
            note_length: newNote.length,
          },
          organizationId: profile.organization_id,
        });
      }
      
      setNewNote('');
      await fetchReportNotes(selectedReport.id);
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const openReportDetails = async (report: Report) => {
    setSelectedReport(report);
    await fetchReportNotes(report.id);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "reviewing": return "bg-yellow-100 text-yellow-800";
      case "investigating": return "bg-orange-100 text-orange-800";
      case "resolved": return "bg-emerald-100 text-emerald-800";
      case "closed": return "bg-gray-100 text-gray-800";
      case "archived": return "bg-purple-100 text-purple-800";
      case "deleted": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "new": return <AlertTriangle className="h-4 w-4" />;
      case "reviewing": return <Clock className="h-4 w-4" />;
      case "investigating": return <Eye className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      case "closed": return <XCircle className="h-4 w-4" />;
      case "archived": return <Archive className="h-4 w-4" />;
      case "deleted": return <Trash2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "text-red-600 font-bold";
      case 2: return "text-orange-600 font-semibold";
      case 3: return "text-yellow-600";
      case 4: return "text-green-600";
      case 5: return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority.toString() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading reports...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      <ReportsStatistics />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>{t('reportManagement')}</span>
          </CardTitle>
          <CardDescription>
            {t('viewManageTrackReports')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by title or tracking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">In Review</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                {showDeleted && <SelectItem value="deleted">Deleted</SelectItem>}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="1">Priority 1 (High)</SelectItem>
                <SelectItem value="2">Priority 2</SelectItem>
                <SelectItem value="3">Priority 3 (Medium)</SelectItem>
                <SelectItem value="4">Priority 4</SelectItem>
                <SelectItem value="5">Priority 5 (Low)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showDeleted ? "default" : "outline"}
              onClick={() => {
                setShowDeleted(!showDeleted);
                fetchReports();
              }}
              className="whitespace-nowrap"
            >
              {showDeleted ? "Hide Deleted" : "Show Deleted"}
            </Button>
          </div>

          {/* Reports Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono">{report.tracking_id}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(report.status)}
                            <span>{formatStatus(report.status)}</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={getPriorityColor(report.priority)}>
                          Level {report.priority}
                        </span>
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
                      <TableCell className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReportDetails(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {report.status === 'new' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(report.id)}
                              title="Mark as Read"
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status !== 'closed' && report.status !== 'deleted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => closeReport(report.id)}
                              title="Close Case"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status !== 'archived' && report.status !== 'deleted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => archiveReport(report.id)}
                              title="Archive"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status === 'deleted' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restoreReport(report.id)}
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteReport(report.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details: {selectedReport?.tracking_id}</DialogTitle>
            <DialogDescription>
              View and manage report information
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <p className="text-sm">{selectedReport.title}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Select 
                      value={selectedReport.status} 
                      onValueChange={(value: ReportStatus) => updateReportStatus(selectedReport.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewing">In Review</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        {selectedReport.status === 'deleted' && (
                          <SelectItem value="deleted">Deleted</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <p className="text-sm">Level {selectedReport.priority}</p>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <div className="mt-1">
                    <Select 
                      value={selectedReport.assigned_to || "unassigned"} 
                      onValueChange={(value) => assignReport(selectedReport.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.first_name} {member.last_name} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTags(!editingTags);
                      setTempTags(selectedReport.tags || []);
                    }}
                  >
                    <Tags className="h-4 w-4 mr-1" />
                    {editingTags ? 'Cancel' : 'Edit Tags'}
                  </Button>
                </div>
                <div className="mt-2">
                  {editingTags ? (
                    <div className="space-y-2">
                      <TagEditor
                        tags={tempTags}
                        onTagsChange={setTempTags}
                        placeholder="Add tags..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => updateReportTags(selectedReport.id, tempTags)}
                        >
                          Save Tags
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTags(false);
                            setTempTags(selectedReport.tags || []);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedReport.tags && selectedReport.tags.length > 0 ? (
                        selectedReport.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No tags</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <Label>Internal Notes</Label>
                <div className="mt-2 space-y-4">
                  {reportNotes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">
                          {note.profiles?.first_name} {note.profiles?.last_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                  
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add an internal note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={addNote} disabled={!newNote.trim()}>
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManagement;
