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
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { createBrandedPDF, addPDFSection, addPDFField, addPDFTable, downloadPDF, exportToCSV, formatExportDate } from '@/utils/export-utils';

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
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  
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
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Policies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading policies...
                  </TableCell>
                </TableRow>
              ) : filteredPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No policies found. Create your first policy to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
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
    </div>
  );
}

