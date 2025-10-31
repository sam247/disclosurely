import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Plus, 
  Eye,
  TrendingUp,
  Filter,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createBrandedPDF, addPDFSection, addPDFField, addPDFTable, downloadPDF, exportToCSV, formatExportDate } from '@/utils/export-utils';

interface Risk {
  id: string;
  risk_title: string;
  risk_description: string | null;
  category: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  mitigation_status: string;
  mitigation_plan: string | null;
  residual_likelihood: number | null;
  residual_impact: number | null;
  residual_score: number | null;
  owner_name: string | null;
  created_at: string;
}

export default function ComplianceRisks() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    risk_title: '',
    risk_description: '',
    category: 'operational',
    likelihood: 3,
    impact: 3,
    mitigation_status: 'identified',
    mitigation_plan: '',
    owner_name: ''
  });

  useEffect(() => {
    if (organization?.id) {
      loadRisks();
    }
  }, [organization?.id]);

  useEffect(() => {
    filterRisks();
  }, [risks, categoryFilter, statusFilter]);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_risks')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('risk_score', { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error) {
      console.error('Error loading risks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load risks.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRisks = () => {
    let filtered = [...risks];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.mitigation_status === statusFilter);
    }

    setFilteredRisks(filtered);
  };

  const handleCreateRisk = async () => {
    try {
      const { error } = await supabase
        .from('compliance_risks')
        .insert({
          organization_id: organization?.id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: '✅ Risk Registered',
        description: `${formData.risk_title} has been added to the risk register.`
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadRisks();
    } catch (error) {
      console.error('Error creating risk:', error);
      toast({
        title: 'Error',
        description: 'Failed to register risk.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      risk_title: '',
      risk_description: '',
      category: 'operational',
      likelihood: 3,
      impact: 3,
      mitigation_status: 'identified',
      mitigation_plan: '',
      owner_name: ''
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      financial: 'Financial',
      operational: 'Operational',
      strategic: 'Strategic',
      compliance: 'Compliance',
      reputational: 'Reputational',
      security: 'Security',
      legal: 'Legal',
      environmental: 'Environmental',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; className?: string }> = {
      identified: { variant: 'secondary', label: 'Identified' },
      assessing: { variant: 'default', label: 'Assessing', className: 'bg-blue-100 text-blue-800' },
      mitigating: { variant: 'default', label: 'Mitigating', className: 'bg-yellow-100 text-yellow-800' },
      monitoring: { variant: 'default', label: 'Monitoring', className: 'bg-purple-100 text-purple-800' },
      closed: { variant: 'default', label: 'Closed', className: 'bg-green-100 text-green-800' }
    };
    
    const { variant, label, className } = config[status] || config.identified;
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const getRiskColor = (score: number) => {
    if (score >= 15) return 'bg-red-500';
    if (score >= 10) return 'bg-orange-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 15) return 'Critical';
    if (score >= 10) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  };

  // Export risks as PDF
  const exportRisksToPDF = () => {
    try {
      if (filteredRisks.length === 0) {
        toast({
          title: 'No Data',
          description: 'No risks to export.',
          variant: 'destructive'
        });
        return;
      }

      const doc = createBrandedPDF('Risk Register', organization?.name || '');
      
      let y = 50;
      y = addPDFSection(doc, 'Risk Summary', y);
      y = addPDFField(doc, 'Total Risks', filteredRisks.length.toString(), y);
      y = addPDFField(doc, 'Critical Risks', filteredRisks.filter(r => r.risk_score >= 15).length.toString(), y);
      y = addPDFField(doc, 'High Risks', filteredRisks.filter(r => r.risk_score >= 10 && r.risk_score < 15).length.toString(), y);
      y = addPDFField(doc, 'Medium Risks', filteredRisks.filter(r => r.risk_score >= 5 && r.risk_score < 10).length.toString(), y);
      y = addPDFField(doc, 'Low Risks', filteredRisks.filter(r => r.risk_score < 5).length.toString(), y);
      
      y += 5;
      
      // Table headers
      const headers = ['Risk Title', 'Category', 'L', 'I', 'Score', 'Status', 'Owner'];
      
      // Table data
      const tableData = filteredRisks.map(risk => [
        risk.risk_title,
        getCategoryLabel(risk.category),
        risk.likelihood.toString(),
        risk.impact.toString(),
        `${risk.risk_score} (${getRiskLabel(risk.risk_score)})`,
        risk.mitigation_status.toUpperCase(),
        risk.owner_name || 'Unassigned'
      ]);
      
      addPDFTable(doc, headers, tableData, y);
      
      downloadPDF(doc, `risk-register-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: 'PDF Generated',
        description: `${filteredRisks.length} risks exported successfully.`
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

  // Export risks as CSV
  const exportRisksToCSV = () => {
    try {
      if (filteredRisks.length === 0) {
        toast({
          title: 'No Data',
          description: 'No risks to export.',
          variant: 'destructive'
        });
        return;
      }

      const csvData = filteredRisks.map(risk => ({
        'Risk Title': risk.risk_title,
        'Description': risk.risk_description || '',
        'Category': getCategoryLabel(risk.category),
        'Likelihood': risk.likelihood,
        'Impact': risk.impact,
        'Risk Score': risk.risk_score,
        'Risk Level': getRiskLabel(risk.risk_score),
        'Mitigation Status': risk.mitigation_status.toUpperCase(),
        'Mitigation Plan': risk.mitigation_plan || '',
        'Residual Likelihood': risk.residual_likelihood || '',
        'Residual Impact': risk.residual_impact || '',
        'Residual Score': risk.residual_score || '',
        'Owner': risk.owner_name || 'Unassigned',
        'Created': formatExportDate(risk.created_at)
      }));

      exportToCSV(csvData, `risks-export-${new Date().toISOString().split('T')[0]}`);

      toast({
        title: 'CSV Generated',
        description: `${filteredRisks.length} risks exported successfully.`
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

  // Risk Matrix Component
  const RiskMatrix = () => {
    const matrixRisks: Record<string, Risk[]> = {};
    
    risks.forEach(risk => {
      const key = `${risk.likelihood}-${risk.impact}`;
      if (!matrixRisks[key]) {
        matrixRisks[key] = [];
      }
      matrixRisks[key].push(risk);
    });

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          Impact →
        </div>
        <div className="grid grid-cols-6 gap-2">
          {/* Y-axis label */}
          <div className="flex flex-col justify-center items-center row-span-5">
            <div className="text-sm text-muted-foreground transform -rotate-90 whitespace-nowrap">
              ← Likelihood
            </div>
          </div>

          {/* Header row */}
          {[1, 2, 3, 4, 5].map(impact => (
            <div key={`header-${impact}`} className="text-center text-xs font-medium text-muted-foreground py-2">
              {impact}
            </div>
          ))}

          {/* Matrix cells (reverse order for likelihood so 5 is at top) */}
          {[5, 4, 3, 2, 1].map(likelihood => (
            <React.Fragment key={`row-${likelihood}`}>
              {/* Row label */}
              <div className="flex items-center justify-center text-xs font-medium text-muted-foreground">
                {likelihood}
              </div>
              
              {/* Cells */}
              {[1, 2, 3, 4, 5].map(impact => {
                const score = likelihood * impact;
                const key = `${likelihood}-${impact}`;
                const cellRisks = matrixRisks[key] || [];
                
                return (
                  <div
                    key={key}
                    className={cn(
                      "relative h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity",
                      score >= 15 ? "bg-red-100 border-red-300" :
                      score >= 10 ? "bg-orange-100 border-orange-300" :
                      score >= 5 ? "bg-yellow-100 border-yellow-300" :
                      "bg-green-100 border-green-300"
                    )}
                    title={cellRisks.length > 0 ? cellRisks.map(r => r.risk_title).join(', ') : 'No risks'}
                  >
                    {cellRisks.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-bold">{cellRisks.length}</div>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 text-[10px] font-medium text-muted-foreground">
                      {score}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>Low (1-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span>Medium (5-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
            <span>High (10-14)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span>Critical (15-25)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Register</h1>
            <p className="text-muted-foreground">Track and manage organizational risks</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Risk
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Heat Map</CardTitle>
          <CardDescription>
            Visual representation of risks by likelihood and impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RiskMatrix />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportRisksToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportRisksToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="strategic">Strategic</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="reputational">Reputational</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="identified">Identified</SelectItem>
                <SelectItem value="assessing">Assessing</SelectItem>
                <SelectItem value="mitigating">Mitigating</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading risks...
            </CardContent>
          </Card>
        ) : filteredRisks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No risks found. Register your first risk to get started.
            </CardContent>
          </Card>
        ) : (
          filteredRisks.map((risk) => (
            <Card key={risk.id} className="hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", getRiskColor(risk.risk_score).replace('bg-', 'bg-opacity-20 bg-'))}>
                        <AlertTriangle className={cn("h-5 w-5", getRiskColor(risk.risk_score).replace('bg-', 'text-'))} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{risk.risk_title}</h3>
                        {risk.risk_description && (
                          <p className="text-sm text-muted-foreground mt-1">{risk.risk_description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline">{getCategoryLabel(risk.category)}</Badge>
                      {getStatusBadge(risk.mitigation_status)}
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getRiskColor(risk.risk_score))}></div>
                        <span className="text-sm font-medium">{getRiskLabel(risk.risk_score)} Risk</span>
                        <span className="text-xs text-muted-foreground">(Score: {risk.risk_score})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                      <div>
                        <span className="text-muted-foreground">Likelihood:</span>
                        <span className="ml-2 font-medium">{risk.likelihood}/5</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Impact:</span>
                        <span className="ml-2 font-medium">{risk.impact}/5</span>
                      </div>
                      {risk.owner_name && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Owner:</span>
                          <span className="ml-2 font-medium">{risk.owner_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRisk(risk);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>

      {/* Create Risk Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Risk</DialogTitle>
            <DialogDescription>
              Add a new risk to your organization's risk register
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="risk_title">Risk Title *</Label>
              <Input
                id="risk_title"
                placeholder="e.g., Data breach from third-party vendor"
                value={formData.risk_title}
                onChange={(e) => setFormData({ ...formData, risk_title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_description">Description</Label>
              <Textarea
                id="risk_description"
                placeholder="Describe the risk in detail..."
                value={formData.risk_description}
                onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="reputational">Reputational</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mitigation_status">Status *</Label>
                <Select 
                  value={formData.mitigation_status} 
                  onValueChange={(value) => setFormData({ ...formData, mitigation_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="assessing">Assessing</SelectItem>
                    <SelectItem value="mitigating">Mitigating</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium">Risk Assessment</div>
              
              <div className="space-y-2">
                <Label htmlFor="likelihood">
                  Likelihood (1-5): {formData.likelihood}
                  <span className="text-xs text-muted-foreground ml-2">
                    1=Rare, 5=Almost Certain
                  </span>
                </Label>
                <Input
                  id="likelihood"
                  type="range"
                  min="1"
                  max="5"
                  value={formData.likelihood}
                  onChange={(e) => setFormData({ ...formData, likelihood: parseInt(e.target.value) })}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact">
                  Impact (1-5): {formData.impact}
                  <span className="text-xs text-muted-foreground ml-2">
                    1=Insignificant, 5=Catastrophic
                  </span>
                </Label>
                <Input
                  id="impact"
                  type="range"
                  min="1"
                  max="5"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                <div className={cn("w-3 h-3 rounded-full", getRiskColor(formData.likelihood * formData.impact))}></div>
                <span className="font-medium">Risk Score: {formData.likelihood * formData.impact}</span>
                <span className="text-sm text-muted-foreground">
                  ({getRiskLabel(formData.likelihood * formData.impact)} Risk)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitigation_plan">Mitigation Plan</Label>
              <Textarea
                id="mitigation_plan"
                placeholder="Describe how this risk will be mitigated..."
                value={formData.mitigation_plan}
                onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Risk Owner</Label>
              <Input
                id="owner_name"
                placeholder="e.g., John Smith, Risk Manager"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRisk} disabled={!formData.risk_title}>
              Register Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Risk Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRisk?.risk_title}</DialogTitle>
            <DialogDescription>Risk Details</DialogDescription>
          </DialogHeader>
          {selectedRisk && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{getCategoryLabel(selectedRisk.category)}</Badge>
                {getStatusBadge(selectedRisk.mitigation_status)}
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", getRiskColor(selectedRisk.risk_score))}></div>
                  <span className="text-sm font-medium">{getRiskLabel(selectedRisk.risk_score)} Risk</span>
                  <span className="text-xs text-muted-foreground">(Score: {selectedRisk.risk_score})</span>
                </div>
              </div>

              {selectedRisk.risk_description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRisk.risk_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Likelihood</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRisk.likelihood}/5</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Impact</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRisk.impact}/5</p>
                </div>
              </div>

              {selectedRisk.mitigation_plan && (
                <div>
                  <Label className="text-sm font-medium">Mitigation Plan</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedRisk.mitigation_plan}
                  </div>
                </div>
              )}

              {selectedRisk.residual_likelihood && selectedRisk.residual_impact && (
                <div>
                  <Label className="text-sm font-medium">Residual Risk</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Residual Likelihood:</span>
                      <span className="ml-2 font-medium">{selectedRisk.residual_likelihood}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Residual Impact:</span>
                      <span className="ml-2 font-medium">{selectedRisk.residual_impact}/5</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Residual Score:</span>
                      <span className="ml-2 font-medium">{selectedRisk.residual_score}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedRisk.owner_name && (
                <div>
                  <Label className="text-sm font-medium">Risk Owner</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRisk.owner_name}</p>
                </div>
              )}
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

