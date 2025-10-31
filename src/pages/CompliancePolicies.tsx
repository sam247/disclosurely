import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Archive,
  Eye,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  MoreHorizontal,
  Send,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { createBrandedPDF, addPDFSection, addPDFField, addPDFTable, downloadPDF, exportToCSV, formatExportDate } from '@/utils/export-utils';
import { PolicyAssignmentDialog } from '@/components/PolicyAssignmentDialog';

interface Policy {
  id: string;
  policy_name: string;
  policy_type: string;
  status: string;
  version: number;
  effective_date: string | null;
  next_review_date: string | null;
  owner_name: string | null;
  policy_description: string | null;
  policy_content: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface AcknowledgmentStats {
  total_assigned: number;
  total_acknowledged: number;
  pending_count: number;
  acknowledgment_rate: number;
}

export default function CompliancePolicies() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [ackStats, setAckStats] = useState<Map<string, AcknowledgmentStats>>(new Map());
  
  // Bulk actions state
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());
  
  // Bulk actions handlers
  const toggleSelectAll = () => {
    if (selectedPolicies.size === filteredPolicies.length) {
      setSelectedPolicies(new Set());
    } else {
      setSelectedPolicies(new Set(filteredPolicies.map(p => p.id)));
    }
  };
  
  const toggleSelectPolicy = (policyId: string) => {
    const newSelected = new Set(selectedPolicies);
    if (newSelected.has(policyId)) {
      newSelected.delete(policyId);
    } else {
      newSelected.add(policyId);
    }
    setSelectedPolicies(newSelected);
  };
  
  const handleBulkArchive = async () => {
    try {
      const { error } = await supabase
        .from('compliance_policies')
        .update({ status: 'archived' })
        .in('id', Array.from(selectedPolicies));
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Archived ${selectedPolicies.size} policies`
      });
      
      setSelectedPolicies(new Set());
      loadPolicies();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive policies',
        variant: 'destructive'
      });
    }
  };
  
  const handleBulkReminder = async () => {
    toast({
      title: 'Reminders Sent',
      description: `Sending reminders for ${selectedPolicies.size} policies`
    });
    setSelectedPolicies(new Set());
  };
  
  // Form states
  const [formData, setFormData] = useState({
    policy_name: '',
    policy_type: 'data_privacy',
    policy_description: '',
    policy_content: '',
    effective_date: '',
    next_review_date: '',
    owner_name: '',
    status: 'draft'
  });

  useEffect(() => {
    if (organization?.id) {
      loadPolicies();
      loadAcknowledgmentStats();
    }
  }, [organization?.id]);

  useEffect(() => {
    filterAndSortPolicies();
  }, [policies, searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_policies')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load policies.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAcknowledgmentStats = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_acknowledgment_summary')
        .select('*')
        .eq('organization_id', organization?.id);

      if (error) throw error;

      const statsMap = new Map<string, AcknowledgmentStats>();
      data?.forEach((stat: any) => {
        statsMap.set(stat.policy_id, {
          total_assigned: stat.total_assigned || 0,
          total_acknowledged: stat.total_acknowledged || 0,
          pending_count: stat.pending_count || 0,
          acknowledgment_rate: stat.acknowledgment_rate || 0
        });
      });

      setAckStats(statsMap);
    } catch (error) {
      console.error('Error loading acknowledgment stats:', error);
    }
  };

  const filterAndSortPolicies = () => {
    let filtered = [...policies];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.policy_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.policy_description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.policy_type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof Policy];
      const bVal = b[sortField as keyof Policy];
      
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredPolicies(filtered);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const { error } = await supabase
        .from('compliance_policies')
        .insert({
          organization_id: organization?.id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: '✅ Policy Created',
        description: `${formData.policy_name} has been created.`
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadPolicies();
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create policy.',
        variant: 'destructive'
      });
    }
  };

  const handleArchivePolicy = async (policyId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_policies')
        .update({ status: 'archived' })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: '🗃️ Policy Archived',
        description: 'Policy has been moved to archived.'
      });

      loadPolicies();
    } catch (error) {
      console.error('Error archiving policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive policy.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      policy_name: '',
      policy_type: 'data_privacy',
      policy_description: '',
      policy_content: '',
      effective_date: '',
      next_review_date: '',
      owner_name: '',
      status: 'draft'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      under_review: { variant: 'default', label: 'Under Review' },
      active: { variant: 'default', label: 'Active' },
      archived: { variant: 'outline', label: 'Archived' }
    };
    
    const config = variants[status] || variants.draft;
    const className = status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : '';
    
    return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      data_privacy: 'Data Privacy',
      hr: 'HR',
      financial: 'Financial',
      security: 'Security',
      operational: 'Operational',
      environmental: 'Environmental',
      legal: 'Legal',
      ethics: 'Ethics',
      other: 'Other'
    };
    return labels[type] || type;
  };

  // Export policies as PDF
  const exportPoliciesToPDF = () => {
    try {
      if (filteredPolicies.length === 0) {
        toast({
          title: 'No Data',
          description: 'No policies to export.',
          variant: 'destructive'
        });
        return;
      }

      const doc = createBrandedPDF('Policy Register', organization?.name || '');
      
      let y = 50;
      y = addPDFSection(doc, 'Policy Summary', y);
      y = addPDFField(doc, 'Total Policies', filteredPolicies.length.toString(), y);
      y = addPDFField(doc, 'Active Policies', filteredPolicies.filter(p => p.status === 'active').length.toString(), y);
      y = addPDFField(doc, 'Policies Under Review', filteredPolicies.filter(p => p.status === 'under_review').length.toString(), y);
      y = addPDFField(doc, 'Draft Policies', filteredPolicies.filter(p => p.status === 'draft').length.toString(), y);
      
      y += 5;
      
      // Table headers
      const headers = ['Policy Name', 'Type', 'Status', 'Version', 'Review Date', 'Owner'];
      
      // Table data
      const tableData = filteredPolicies.map(policy => [
        policy.policy_name,
        getTypeBadge(policy.policy_type),
        policy.status.toUpperCase(),
        `v${policy.version}`,
        policy.next_review_date ? formatExportDate(policy.next_review_date) : 'N/A',
        policy.owner_name || 'Unassigned'
      ]);
      
      addPDFTable(doc, headers, tableData, y);
      
      downloadPDF(doc, `policy-register-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: 'PDF Generated',
        description: `${filteredPolicies.length} policies exported successfully.`
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF.',
        variant: 'destructive'
      });
    }
  };

  // Export policies as CSV
  const exportPoliciesToCSV = () => {
    try {
      if (filteredPolicies.length === 0) {
        toast({
          title: 'No Data',
          description: 'No policies to export.',
          variant: 'destructive'
        });
        return;
      }

      const csvData = filteredPolicies.map(policy => ({
        'Policy Name': policy.policy_name,
        'Type': getTypeBadge(policy.policy_type),
        'Status': policy.status.toUpperCase(),
        'Version': `v${policy.version}`,
        'Description': policy.policy_description || '',
        'Effective Date': policy.effective_date ? formatExportDate(policy.effective_date) : 'N/A',
        'Next Review Date': policy.next_review_date ? formatExportDate(policy.next_review_date) : 'N/A',
        'Owner': policy.owner_name || 'Unassigned',
        'Created': formatExportDate(policy.created_at),
        'Last Updated': formatExportDate(policy.updated_at)
      }));

      exportToCSV(csvData, `policies-export-${new Date().toISOString().split('T')[0]}`);

      toast({
        title: 'CSV Generated',
        description: `${filteredPolicies.length} policies exported successfully.`
      });
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate CSV.',
        variant: 'destructive'
      });
    }
  };

  const isReviewDue = (reviewDate: string | null) => {
    if (!reviewDate) return false;
    const date = new Date(reviewDate);
    const today = new Date();
    const daysUntil = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil >= 0;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Policy Tracker</h1>
            <p className="text-muted-foreground">Manage compliance policies and documents</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportPoliciesToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportPoliciesToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="data_privacy">Data Privacy</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="ethics">Ethics</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredPolicies.length} of {policies.length} policies
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedPolicies.size > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedPolicies.size} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      // Bulk assign - open dialog with selected policies
                      toast({
                        title: 'Bulk Assignment',
                        description: 'Select a policy to assign (multi-policy assignment coming soon)'
                      });
                    }}>
                      <Send className="h-4 w-4 mr-2" />
                      Bulk Assign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkReminder}>
                      <Clock className="h-4 w-4 mr-2" />
                      Send Reminders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleBulkArchive}
                      className="text-destructive"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedPolicies(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedPolicies.size === filteredPolicies.length && filteredPolicies.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort('policy_name')}>
                  <div className="flex items-center gap-2">
                    Policy Name
                    {sortField === 'policy_name' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Acknowledgments</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('next_review_date')}>
                  <div className="flex items-center gap-2">
                    Next Review
                    {sortField === 'next_review_date' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading policies...
                  </TableCell>
                </TableRow>
              ) : filteredPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No policies found. Create your first policy to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPolicies.has(policy.id)}
                        onCheckedChange={() => toggleSelectPolicy(policy.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{policy.policy_name}</div>
                        {policy.policy_description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {policy.policy_description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getTypeBadge(policy.policy_type)}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(policy.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {policy.owner_name || 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const stats = ackStats.get(policy.id);
                        if (!stats || stats.total_assigned === 0) {
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPolicy(policy);
                                setIsAssignDialogOpen(true);
                              }}
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          );
                        }
                        const rate = Math.round(stats.acknowledgment_rate);
                        const colorClass = rate === 100 
                          ? 'text-green-600' 
                          : rate >= 50 
                          ? 'text-amber-600' 
                          : 'text-red-600';
                        
                        return (
                          <div className="space-y-2 min-w-[180px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium">
                                {stats.total_acknowledged}/{stats.total_assigned}
                              </span>
                              <span className={`text-xs font-bold ${colorClass}`}>
                                {rate}%
                              </span>
                            </div>
                            <Progress 
                              value={rate} 
                              className={`h-2 ${
                                rate === 100 
                                  ? '[&>div]:bg-green-600' 
                                  : rate >= 50 
                                  ? '[&>div]:bg-amber-500' 
                                  : '[&>div]:bg-red-500'
                              }`}
                            />
                            {stats.pending_count > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {stats.pending_count} pending
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {policy.next_review_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{format(new Date(policy.next_review_date), 'MMM d, yyyy')}</span>
                          {isReviewDue(policy.next_review_date) && (
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {policy.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setIsAssignDialogOpen(true);
                            }}
                            title="Assign to team members"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchivePolicy(policy.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>

      {/* Create Policy Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>
              Add a new compliance policy to your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policy_name">Policy Name *</Label>
              <Input
                id="policy_name"
                placeholder="e.g., Data Protection Policy"
                value={formData.policy_name}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_type">Policy Type *</Label>
                <Select 
                  value={formData.policy_type} 
                  onValueChange={(value) => setFormData({ ...formData, policy_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_privacy">Data Privacy</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="ethics">Ethics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_description">Description</Label>
              <Textarea
                id="policy_description"
                placeholder="Brief description of what this policy covers..."
                value={formData.policy_description}
                onChange={(e) => setFormData({ ...formData, policy_description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_content">Policy Content</Label>
              <Textarea
                id="policy_content"
                placeholder="Enter the full policy text or guidelines..."
                value={formData.policy_content}
                onChange={(e) => setFormData({ ...formData, policy_content: e.target.value })}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_review_date">Next Review Date</Label>
                <Input
                  id="next_review_date"
                  type="date"
                  value={formData.next_review_date}
                  onChange={(e) => setFormData({ ...formData, next_review_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Policy Owner</Label>
              <Input
                id="owner_name"
                placeholder="e.g., Jane Smith, Compliance Manager"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePolicy} disabled={!formData.policy_name}>
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Policy Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPolicy?.policy_name}</DialogTitle>
            <DialogDescription>
              Policy Details • Version {selectedPolicy?.version}
            </DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedPolicy.status)}
                <Badge variant="outline">{getTypeBadge(selectedPolicy.policy_type)}</Badge>
              </div>

              {selectedPolicy.policy_description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPolicy.policy_description}</p>
                </div>
              )}

              {selectedPolicy.policy_content && (
                <div>
                  <Label className="text-sm font-medium">Policy Content</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedPolicy.policy_content}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-sm font-medium">Owner</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPolicy.owner_name || 'Unassigned'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPolicy.version}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Effective Date</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPolicy.effective_date ? format(new Date(selectedPolicy.effective_date), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Next Review</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPolicy.next_review_date ? format(new Date(selectedPolicy.next_review_date), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Assignment Dialog */}
      {selectedPolicy && (
        <PolicyAssignmentDialog
          isOpen={isAssignDialogOpen}
          onClose={() => {
            setIsAssignDialogOpen(false);
            setSelectedPolicy(null);
          }}
          policyId={selectedPolicy.id}
          policyName={selectedPolicy.policy_name}
          onAssignmentComplete={() => {
            loadAcknowledgmentStats();
            loadPolicies();
          }}
        />
      )}
    </div>
  );
}

