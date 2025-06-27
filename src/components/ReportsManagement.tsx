
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Search, Filter, FileText, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import type { Report, ReportStatus } from '@/types/database';
import ReportViewModal from './ReportViewModal';

interface ReportWithAssignee extends Report {
  assignee_profile: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const ReportsManagement = () => {
  const { user, signOut } = useAuth();
  const { createAuditLog } = useAuditLog();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportWithAssignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<ReportWithAssignee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; email: string; first_name: string | null; last_name: string | null; }[]>([]);

  const reportStatuses: { value: ReportStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'in_review', label: 'In Review' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  useEffect(() => {
    if (user) {
      fetchReports();
      fetchUsers();
    }
  }, [user, searchTerm, statusFilter]);

  const fetchReports = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        console.log('No organization found for user');
        setLoading(false);
        return;
      }

      console.log('Fetching reports for organization:', profile.organization_id);

      // Build query
      let query = supabase
        .from('reports')
        .select(`
          *,
          assignee_profile:assigned_to (
            email,
            first_name,
            last_name
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Fetched reports:', data?.length || 0, 'records');

      // Apply search filter locally
      let filteredData = data || [];
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredData = filteredData.filter(report =>
          report.title.toLowerCase().includes(lowerSearchTerm) ||
          report.tracking_id.toLowerCase().includes(lowerSearchTerm)
        );
      }

      setReports(filteredData as ReportWithAssignee[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        console.log('No organization found for user');
        return;
      }

      // Fetch users in the same organization
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('organization_id', profile.organization_id);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const viewReport = async (reportId: string) => {
    // Create audit log for viewing
    await createAuditLog('viewed', reportId, { 
      viewed_by: user?.id,
      viewed_at: new Date().toISOString()
    });
    
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    // All status badges are now blue
    return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reports Management
              </CardTitle>
              <CardDescription>
                Manage and monitor all reports submitted to your organization ({reports.length} total reports)
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or tracking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | 'all')}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No reports found for the selected criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{report.tracking_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-96">{report.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(report.status)}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.assignee_profile ? (
                          <div className="text-sm">
                            <div className="font-medium">{report.assignee_profile.email}</div>
                            {(report.assignee_profile.first_name || report.assignee_profile.last_name) && (
                              <div className="text-gray-500">
                                {report.assignee_profile.first_name} {report.assignee_profile.last_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {format(new Date(report.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewReport(report.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReportViewModal
        report={selectedReport}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedReport(null);
        }}
        onReportUpdated={fetchReports}
        users={users}
      />
    </div>
  );
};

export default ReportsManagement;
