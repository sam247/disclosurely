import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useUserRoles } from '@/hooks/useUserRoles';
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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MoreHorizontal,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { auditLogger, AuditLogEntry, AuditLogFilters, AuditChainVerification } from '@/utils/auditLogger';

const AuditLogView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { isAdmin } = useUserRoles();
  
  // Core state
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [chainVerification, setChainVerification] = useState<AuditChainVerification | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [newRecordsCount, setNewRecordsCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof AuditLogEntry>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('');
  const [action, setAction] = useState('');
  const [severity, setSeverity] = useState('');
  const [actorType, setActorType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [searchText, setSearchText] = useState('');
  
  // Auto-refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);

  // Computed values
  const totalPages = Math.ceil(total / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);
  
  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (category && category !== 'all') count++;
    if (action && action !== 'all') count++;
    if (severity && severity !== 'all') count++;
    if (actorType && actorType !== 'all') count++;
    if (targetType && targetType !== 'all') count++;
    if (searchText) count++;
    return count;
  }, [dateFrom, dateTo, category, action, severity, actorType, targetType, searchText]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled || userInteracting || !organization?.id) return;
    
    const interval = setInterval(() => {
      fetchLogs(true);
      setLastRefreshTime(new Date());
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, userInteracting, organization?.id]);

  // User interaction timeout
  useEffect(() => {
    if (!userInteracting) return;
    
    const timeout = setTimeout(() => {
      setUserInteracting(false);
    }, 10000); // Resume after 10 seconds
    
    return () => clearTimeout(timeout);
  }, [userInteracting]);

  useEffect(() => {
    if (organization?.id) {
      fetchLogs();
      verifyChain();
    }
  }, [organization?.id]);


  const fetchLogs = useCallback(async (resetPage = false) => {
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
        limit: pageSize,
        offset: resetPage ? 0 : (currentPage - 1) * pageSize
      };

      const result = await auditLogger.getLogs(currentFilters);
      
      setLogs(result.logs);
      setTotal(result.total);
      
      if (resetPage) {
        setCurrentPage(1);
        setNewRecordsCount(0);
      }
      
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
  }, [organization?.id, dateFrom, dateTo, category, action, severity, actorType, targetType, searchText, pageSize, currentPage]);

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
    setUserInteracting(true);
    fetchLogs(true);
  };

  const handleSort = (field: keyof AuditLogEntry) => {
    setUserInteracting(true);
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    fetchLogs(true);
  };

  const handlePageChange = (page: number) => {
    setUserInteracting(true);
    setCurrentPage(page);
    fetchLogs();
  };

  const handlePageSizeChange = (newSize: number) => {
    setUserInteracting(true);
    setPageSize(newSize);
    setCurrentPage(1);
    fetchLogs(true);
  };

  const clearAllFilters = () => {
    setUserInteracting(true);
    setDateFrom('');
    setDateTo('');
    setCategory('');
    setAction('');
    setSeverity('');
    setActorType('');
    setTargetType('');
    setSearchText('');
    setCurrentPage(1);
    fetchLogs(true);
  };

  const exportLogs = async (format: 'csv' | 'json' | 'excel') => {
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

      let data: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === 'excel') {
        // For Excel, we'll export as CSV for now (can be enhanced later)
        data = await auditLogger.exportLogs(currentFilters, 'csv');
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else {
        data = await auditLogger.exportLogs(currentFilters, format);
        mimeType = format === 'csv' ? 'text/csv' : 'application/json';
        fileExtension = format;
      }
      
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
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
      case 'critical': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'high': return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-3 w-3 text-green-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
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
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  const getSortIcon = (field: keyof AuditLogEntry) => {
    if (sortField !== field) return <MoreHorizontal className="h-3 w-3 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-3 w-3 text-blue-600" /> : 
      <ChevronDown className="h-3 w-3 text-blue-600" />;
  };

  if (!organization) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 88px)', overflow: 'hidden' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Audit Trail</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Loading organization data...
            </p>
          </div>
        </div>
        {/* Empty content area */}
        <div className="flex-1 overflow-hidden min-h-0"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 99px)', overflow: 'hidden' }} data-audit-container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0 px-2 sm:px-0 mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Audit Trail</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Comprehensive system-wide audit log with tamper-evident chain verification
          </p>
        </div>
        
        {/* Chain Verification Status */}
        {chainVerification && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {chainVerification.isValid ? (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs sm:text-sm cursor-help">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Chain Verified</span>
                      <span className="sm:hidden">Verified</span>
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs sm:text-sm cursor-help">
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Chain Invalid</span>
                      <span className="sm:hidden">Invalid</span>
                    </Badge>
                  )}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">
                      {chainVerification.isValid ? 'Chain Verified' : 'Chain Invalid'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {chainVerification.isValid 
                        ? 'The audit trail chain has been verified. Each log entry is cryptographically linked to the previous one, ensuring data integrity and tamper-evidence. This means the audit log has not been modified or corrupted.'
                        : 'The audit trail chain verification failed. This indicates potential tampering or corruption in the audit log. Please investigate immediately.'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {chainVerification.totalRecords} records
            </span>
          </div>
        )}
      </div>

      {/* Filters - Collapsible Horizontal Layout */}
      <div className="border rounded-lg bg-white flex-shrink-0 mx-2 sm:mx-0" style={{ maxHeight: filtersExpanded ? 'none' : '60px' }}>
        <div 
          className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-3 w-3" />
            <span className="font-medium text-xs sm:text-sm">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {filtersExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </div>
        
        {filtersExpanded && (
          <div className="border-t p-2 sm:p-3 space-y-2 sm:space-y-3">
            {/* Horizontal Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 items-end">
              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="dateFrom" className="text-xs font-medium whitespace-nowrap">From:</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="dateTo" className="text-xs font-medium whitespace-nowrap">To:</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              
              {/* Category */}
              <div className="flex items-center space-x-2">
                <Label className="text-xs font-medium whitespace-nowrap">Category:</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 text-xs w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
              
              {/* Action */}
              <div className="flex items-center space-x-2">
                <Label className="text-xs font-medium whitespace-nowrap">Action:</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="h-8 text-xs w-28">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
              
              {/* Severity */}
              <div className="flex items-center space-x-2">
                <Label className="text-xs font-medium whitespace-nowrap">Severity:</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Actor Type */}
              <div className="flex items-center space-x-2">
                <Label className="text-xs font-medium whitespace-nowrap">Actor:</Label>
                <Select value={actorType} onValueChange={setActorType}>
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="scheduled_job">Scheduled Job</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search */}
              <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                <Label className="text-xs font-medium whitespace-nowrap">Search:</Label>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="h-8 text-xs pl-7 w-full sm:w-48"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:col-span-2">
              <Button 
                onClick={handleFilterChange} 
                loading={loading}
                loadingText="Loading..."
                size="sm" 
                className="h-8 text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                Apply
              </Button>
              <Button variant="outline" onClick={clearAllFilters} size="sm" className="h-8 text-xs">
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Excel-Style Table - Fits screen height with internal scrolling, fills remaining space */}
      <div className="border rounded-lg bg-white flex-1 flex flex-col overflow-hidden min-h-0 mx-2 sm:mx-0" style={{ minHeight: 0 }} data-audit-table>
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 border-b bg-gray-50 gap-2 sm:gap-0 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div>
              <h3 className="font-semibold text-xs sm:text-sm">Audit Logs</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing {startRecord}-{endRecord} of {total} records
              </p>
            </div>
            {newRecordsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {newRecordsCount} new
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => fetchLogs(true)}
              disabled={loading}
              size="sm"
              className="h-8 text-xs flex-1 sm:flex-initial"
            >
              <RefreshCw className={`h-3 w-3 sm:mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            {/* Export Dropdown */}
            <Select onValueChange={(value) => exportLogs(value as 'csv' | 'json' | 'excel')}>
              <SelectTrigger className="h-8 text-xs w-full sm:w-24">
                <Download className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Excel-Style Table */}
        {logs.length === 0 && !loading ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No Audit Logs Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              The audit trail system is ready, but no events have been logged yet.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Audit logs will appear here as users interact with the system.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-hidden min-h-0 flex flex-col">
              {/* Scrollable table body - fits screen height, accounting for pagination toolbar (40px) */}
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0" style={{ maxHeight: 'calc(100% - 40px)' }}>
                <table className="w-full">
              {/* Fixed Header */}
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b">
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    style={{ width: '140px' }}
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center justify-between">
                      Timestamp
                      {getSortIcon('created_at')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    style={{ width: '110px' }}
                    onClick={() => handleSort('event_type')}
                  >
                    <div className="flex items-center justify-between">
                      Event Type
                      {getSortIcon('event_type')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    style={{ width: '90px' }}
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center justify-between">
                      Category
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    style={{ width: '100px' }}
                    onClick={() => handleSort('action')}
                  >
                    <div className="flex items-center justify-between">
                      Action
                      {getSortIcon('action')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    style={{ width: '130px' }}
                    onClick={() => handleSort('actor_email')}
                  >
                    <div className="flex items-center justify-between">
                      Actor
                      {getSortIcon('actor_email')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    style={{ width: '130px' }}
                    onClick={() => handleSort('target_name')}
                  >
                    <div className="flex items-center justify-between">
                      Target
                      {getSortIcon('target_name')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    style={{ width: '70px' }}
                    onClick={() => handleSort('severity')}
                  >
                    <div className="flex items-center justify-between">
                      Severity
                      {getSortIcon('severity')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-left text-xs font-semibold text-gray-700 border-r cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('summary')}
                  >
                    <div className="flex items-center justify-between">
                      Summary
                      {getSortIcon('summary')}
                    </div>
                  </th>
                  <th 
                    className="px-2 py-1 text-center text-xs font-semibold text-gray-700"
                    style={{ width: '50px' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {logs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    style={{ height: '22px' }}
                  >
                    <td className="px-2 py-0 text-xs text-gray-900 border-r font-mono">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="px-2 py-0 text-xs text-gray-900 border-r">
                      {log.event_type}
                    </td>
                    <td className="px-2 py-0 text-xs border-r">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {log.category}
                      </Badge>
                    </td>
                    <td className="px-2 py-0 text-xs text-gray-900 border-r">
                      {log.action}
                    </td>
                    <td className="px-2 py-0 text-xs text-gray-900 border-r">
                      <div className="truncate" title={log.actor_email || log.actor_type}>
                        {log.actor_email || log.actor_type}
                      </div>
                    </td>
                    <td className="px-2 py-0 text-xs text-gray-900 border-r">
                      <div className="truncate" title={log.target_name || log.target_type || ''}>
                        {log.target_name || log.target_type || '-'}
                      </div>
                    </td>
                    <td className="px-2 py-0 text-xs border-r">
                      <Badge variant={getSeverityColor(log.severity)} className="text-xs px-1 py-0">
                        {getSeverityIcon(log.severity)}
                        <span className="ml-1 capitalize">{log.severity}</span>
                      </Badge>
                    </td>
                    <td className="px-2 py-0 text-xs text-gray-900 border-r">
                      <div className="truncate" title={log.summary}>
                        {log.summary}
                      </div>
                    </td>
                    <td className="px-2 py-0 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-4 w-4 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
              
              {/* Pagination Footer - Airtable/Spreadsheet style fixed at bottom - Always visible */}
              {total > 0 && (
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
                      {startRecord}-{endRecord} of {total}
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2 p-2 overflow-y-auto flex-1 min-h-0">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-2 space-y-1.5 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="text-xs font-medium truncate">{log.summary}</h4>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mb-1">
                        {formatTimestamp(log.created_at)}
                      </p>
                    </div>
                    <Badge variant={getSeverityColor(log.severity)} className="text-[10px] px-1 py-0 flex-shrink-0">
                      {getSeverityIcon(log.severity)}
                      <span className="ml-0.5 capitalize hidden sm:inline">{log.severity}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Event:</span>
                      <p className="font-medium truncate">{log.event_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="text-[10px] px-0.5 py-0 ml-0.5">
                        {log.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actor:</span>
                      <p className="truncate">{log.actor_email || log.actor_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <p className="truncate">{log.target_name || log.target_type || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end pt-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="h-5 text-[10px] px-2"
                    >
                      <Eye className="h-2.5 w-2.5 mr-0.5" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Mobile Pagination */}
        {total > 0 && (
          <div className="md:hidden flex flex-col sm:flex-row items-center justify-between p-1.5 sm:p-2 border-t bg-gray-50 gap-1.5 sm:gap-0 flex-shrink-0 h-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="flex items-center space-x-1.5">
                <Label className="text-xs whitespace-nowrap">Rows:</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                  <SelectTrigger className="h-6 text-xs w-14">
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
              
              <div className="text-xs text-muted-foreground">
                {startRecord}-{endRecord} of {total}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="h-6 text-xs px-2 flex-1 sm:flex-initial"
              >
                <ChevronLeft className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Prev</span>
              </Button>
              
              {/* Page Numbers */}
              <div className="hidden sm:flex items-center space-x-0.5">
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
                      className="h-6 w-6 text-xs p-0"
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
                className="h-6 text-xs px-2 flex-1 sm:flex-initial"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog - Keep existing implementation */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Audit Log Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Detailed view of audit log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
                  <TabsTrigger value="before" className="text-xs sm:text-sm py-2">Before</TabsTrigger>
                  <TabsTrigger value="after" className="text-xs sm:text-sm py-2">After</TabsTrigger>
                  <TabsTrigger value="raw" className="text-xs sm:text-sm py-2">Raw JSON</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Event Type</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.event_type}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Category</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Action</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.action}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Severity</Label>
                      <Badge variant={getSeverityColor(selectedLog.severity)} className="text-xs">
                        {selectedLog.severity}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Actor</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.actor_email || selectedLog.actor_type}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Target</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.target_name || selectedLog.target_type || 'N/A'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs sm:text-sm font-medium">Summary</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.summary}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs sm:text-sm font-medium">Description</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.description || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Timestamp</Label>
                      <p className="text-xs sm:text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
                    </div>
                    {/* Hide sensitive fields for anonymous cases (PRIVACY FIX H3) */}
                    {selectedLog.actor_type !== 'anonymous' || isAdmin ? (
                      <>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium">IP Address</Label>
                          <p className="text-xs sm:text-sm">{selectedLog.actor_ip_address || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium">User Agent</Label>
                          <p className="text-xs sm:text-sm truncate">{selectedLog.actor_user_agent || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium">Request Path</Label>
                          <p className="text-xs sm:text-sm">{selectedLog.request_path || 'N/A'}</p>
                        </div>
                      </>
                    ) : (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground italic">
                          Sensitive fields (IP address, user agent, session data) are hidden for anonymous actions to protect privacy.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-xs sm:text-sm font-medium">Hash</Label>
                      <p className="text-xs sm:text-sm font-mono break-all">{selectedLog.hash}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Chain Index</Label>
                      <p className="text-xs sm:text-sm">{selectedLog.chain_index}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="before">
                  <pre className="text-xs sm:text-sm bg-muted p-3 sm:p-4 rounded-md overflow-auto">
                    {selectedLog.before_state ? JSON.stringify(selectedLog.before_state, null, 2) : 'No before state'}
                  </pre>
                </TabsContent>
                
                <TabsContent value="after">
                  <pre className="text-xs sm:text-sm bg-muted p-3 sm:p-4 rounded-md overflow-auto">
                    {selectedLog.after_state ? JSON.stringify(selectedLog.after_state, null, 2) : 'No after state'}
                  </pre>
                </TabsContent>
                
                <TabsContent value="raw">
                  <pre className="text-xs sm:text-sm bg-muted p-3 sm:p-4 rounded-md overflow-auto">
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
