import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { 
  Search, 
  Filter, 
  Download, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  User,
  Target,
  Activity,
  Clock,
  Hash,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { auditLogger, AuditLogEntry, AuditLogFilters, AuditChainVerification } from '@/utils/auditLogger';

const AuditLogView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [chainVerification, setChainVerification] = useState<AuditChainVerification | null>(null);
  const [tableExists, setTableExists] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: 50,
    offset: 0
  });
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('');
  const [action, setAction] = useState('');
  const [severity, setSeverity] = useState('');
  const [actorType, setActorType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (organization?.id) {
      fetchLogs();
      verifyChain();
    }
  }, [organization?.id]);

  const fetchLogs = async (resetOffset = false) => {
    if (!organization?.id) return;
    
    setLoading(true);
    try {
      const currentFilters: AuditLogFilters = {
        organizationId: organization.id,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        category: category && category !== 'all' ? category : undefined,
        action: action && action !== 'all' ? action : undefined,
        severity: severity && severity !== 'all' ? severity : undefined,
        actorType: actorType && actorType !== 'all' ? actorType : undefined,
        targetType: targetType && targetType !== 'all' ? targetType : undefined,
        searchText: searchText || undefined,
        limit: filters.limit,
        offset: resetOffset ? 0 : filters.offset
      };

      const result = await auditLogger.getLogs(currentFilters);
      
      // Check if table exists based on result
      if (result.total === 0 && logs.length === 0 && !loading) {
        // This might indicate table doesn't exist, but we'll check more specifically
        setTableExists(true); // Keep optimistic for now
      }
      
      if (resetOffset) {
        setLogs(result.logs);
        setFilters(prev => ({ ...prev, offset: 0 }));
      } else {
        setLogs(prev => [...prev, ...result.logs]);
      }
      
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    if (!organization?.id) return;
    
    try {
      const verification = await auditLogger.verifyChain(organization.id);
      setChainVerification(verification);
    } catch (error) {
      console.error('Error verifying audit chain:', error);
    }
  };

  const handleFilterChange = () => {
    setFilters(prev => ({ ...prev, offset: 0 }));
    fetchLogs(true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setFilters(prev => ({ ...prev, offset: prev.offset + (prev.limit || 50) }));
      fetchLogs();
    }
  };

  const exportLogs = async (format: 'csv' | 'json') => {
    if (!organization?.id) return;
    
    try {
      const currentFilters: AuditLogFilters = {
        organizationId: organization.id,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        category: category && category !== 'all' ? category : undefined,
        action: action && action !== 'all' ? action : undefined,
        severity: severity && severity !== 'all' ? severity : undefined,
        actorType: actorType && actorType !== 'all' ? actorType : undefined,
        targetType: targetType && targetType !== 'all' ? targetType : undefined,
        searchText: searchText || undefined
      };

      const data = await auditLogger.exportLogs(currentFilters, format);
      
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: `Audit logs exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export audit logs',
        variant: 'destructive'
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Loading organization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Comprehensive system-wide audit log with tamper-evident chain verification
          </p>
        </div>
        
        {/* Chain Verification Status */}
        {chainVerification && (
          <div className="flex items-center space-x-2">
            {chainVerification.isValid ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Chain Verified
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Chain Invalid
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {chainVerification.totalRecords} records
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="case_management">Case Management</SelectItem>
                  <SelectItem value="user_management">User Management</SelectItem>
                  <SelectItem value="organization_management">Organization</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="api_access">API Access</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Action */}
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="restore">Restore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Actor Type */}
            <div className="space-y-2">
              <Label>Actor Type</Label>
              <Select value={actorType} onValueChange={setActorType}>
                <SelectTrigger>
                  <SelectValue placeholder="All actors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actors</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="scheduled_job">Scheduled Job</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={handleFilterChange} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => {
              setDateFrom('');
              setDateTo('');
              setCategory('all');
              setAction('all');
              setSeverity('all');
              setActorType('all');
              setTargetType('all');
              setSearchText('');
              setFilters(prev => ({ ...prev, offset: 0 }));
              fetchLogs(true);
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                {total} total records found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => exportLogs('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => exportLogs('json')}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Audit Logs Yet</h3>
              <p className="text-muted-foreground mb-4">
                The audit trail system is ready, but no events have been logged yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Audit logs will appear here as users interact with the system.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm">{formatTimestamp(log.createdAt)}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.eventType}</div>
                            <Badge variant="outline" className="text-xs">
                              {log.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm">{log.actorEmail || log.actorType}</div>
                              <div className="text-xs text-muted-foreground">{log.actorType}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.targetType && (
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm">{log.targetName || log.targetType}</div>
                                <div className="text-xs text-muted-foreground">{log.targetType}</div>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(log.severity)}>
                            {getSeverityIcon(log.severity)}
                            <span className="ml-1 capitalize">{log.severity}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {log.summary}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={loadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed view of audit log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="before">Before</TabsTrigger>
                  <TabsTrigger value="after">After</TabsTrigger>
                  <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Event Type</Label>
                      <p className="text-sm">{selectedLog.eventType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm">{selectedLog.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Action</Label>
                      <p className="text-sm">{selectedLog.action}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Severity</Label>
                      <Badge variant={getSeverityColor(selectedLog.severity)}>
                        {selectedLog.severity}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Actor</Label>
                      <p className="text-sm">{selectedLog.actorEmail || selectedLog.actorType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Target</Label>
                      <p className="text-sm">{selectedLog.targetName || selectedLog.targetType || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Summary</Label>
                      <p className="text-sm">{selectedLog.summary}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm">{selectedLog.description || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Timestamp</Label>
                      <p className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">IP Address</Label>
                      <p className="text-sm">{selectedLog.actorIpAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">User Agent</Label>
                      <p className="text-sm truncate">{selectedLog.actorUserAgent || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Request Path</Label>
                      <p className="text-sm">{selectedLog.requestPath || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Hash</Label>
                      <p className="text-sm font-mono text-xs break-all">{selectedLog.hash}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Chain Index</Label>
                      <p className="text-sm">{selectedLog.chainIndex}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="before">
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                    {selectedLog.beforeState ? JSON.stringify(selectedLog.beforeState, null, 2) : 'No before state'}
                  </pre>
                </TabsContent>
                
                <TabsContent value="after">
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                    {selectedLog.afterState ? JSON.stringify(selectedLog.afterState, null, 2) : 'No after state'}
                  </pre>
                </TabsContent>
                
                <TabsContent value="raw">
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogView;
