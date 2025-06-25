import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, Filter, Calendar, User, FileText, Activity } from 'lucide-react';
import { format } from 'date-fns';
import type { AuditLog, AuditAction } from '@/types/database';

interface AuditLogWithDetails extends AuditLog {
  profiles?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  reports?: {
    title: string;
    tracking_id: string;
  };
}

const AuditTrailManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 25;

  const auditActions: { value: AuditAction | 'all'; label: string }[] = [
    { value: 'all', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'status_changed', label: 'Status Changed' },
    { value: 'message_sent', label: 'Message Sent' },
  ];

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user, searchTerm, actionFilter, dateRange]);

  const fetchAuditLogs = async () => {
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
        setLoading(false);
        return;
      }

      // Calculate date filter
      const dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - parseInt(dateRange));

      // Build query
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name
          ),
          reports:report_id (
            title,
            tracking_id
          )
        `)
        .eq('organization_id', profile.organization_id)
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false });

      // Apply action filter
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;

      // Apply search filter locally
      let filteredData = data || [];
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredData = filteredData.filter(log => 
          log.profiles?.email?.toLowerCase().includes(lowerSearchTerm) ||
          log.reports?.title?.toLowerCase().includes(lowerSearchTerm) ||
          log.reports?.tracking_id?.toLowerCase().includes(lowerSearchTerm) ||
          log.action.toLowerCase().includes(lowerSearchTerm)
        );
      }

      setAuditLogs(filteredData);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = () => {
    if (auditLogs.length === 0) {
      toast({
        title: "No data",
        description: "No audit logs to export",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Date', 'User', 'Action', 'Report', 'Details', 'IP Address'].join(','),
      ...auditLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.profiles?.email || 'System',
        log.action,
        log.reports?.tracking_id || '',
        JSON.stringify(log.details).replace(/"/g, '""'),
        log.ip_address || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Audit trail has been exported to CSV",
    });
  };

  // Helper function to safely render details
  const renderDetails = (details: unknown): JSX.Element => {
    if (!details || (typeof details === 'object' && details !== null && Object.keys(details as object).length === 0)) {
      return <span className="text-gray-400">-</span>;
    }
    
    try {
      const detailsString: string = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
      return (
        <div className="text-xs bg-gray-50 p-2 rounded font-mono">
          {detailsString}
        </div>
      );
    } catch (error) {
      console.error('Error rendering details:', error);
      return <span className="text-gray-400">Invalid data</span>;
    }
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'created': return <FileText className="h-4 w-4" />;
      case 'updated': return <Activity className="h-4 w-4" />;
      case 'viewed': return <Search className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'status_changed': return <Activity className="h-4 w-4" />;
      case 'message_sent': return <FileText className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'status_changed': return 'bg-orange-100 text-orange-800';
      case 'message_sent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const totalPages = Math.ceil(auditLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = auditLogs.slice(startIndex, endIndex);

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
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Trail & Activity Reports
          </CardTitle>
          <CardDescription>
            Complete audit trail of all activities within your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user, report, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as AuditAction | 'all')}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {auditActions.map(action => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAuditLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Report</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No audit logs found for the selected criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(log.created_at), 'MMM dd, yyyy')}
                          <br />
                          <span className="text-gray-500">
                            {format(new Date(log.created_at), 'HH:mm:ss')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.profiles ? (
                            <>
                              <div className="font-medium">{log.profiles.email}</div>
                              {(log.profiles.first_name || log.profiles.last_name) && (
                                <div className="text-gray-500">
                                  {log.profiles.first_name} {log.profiles.last_name}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} flex items-center gap-1 w-fit`}>
                          {getActionIcon(log.action)}
                          {log.action.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.reports ? (
                          <div className="text-sm">
                            <div className="font-medium">{log.reports.tracking_id}</div>
                            <div className="text-gray-500 truncate max-w-32">
                              {log.reports.title}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-48">
                          {renderDetails(log.details)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {log.ip_address || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, auditLogs.length)} of {auditLogs.length} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrailManagement;
