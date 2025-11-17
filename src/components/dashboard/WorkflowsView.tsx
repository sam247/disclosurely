import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings, Clock, History, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  conditions: {
    category?: string;
    urgency?: string;
    keywords?: string[];
  };
  assign_to_user_id?: string;
  assign_to_team?: string;
  created_at: string;
  updated_at: string;
}

interface SLAPolicy {
  id: string;
  name: string;
  critical_response_time: number;
  high_response_time: number;
  medium_response_time: number;
  low_response_time: number;
  escalate_after_breach: boolean;
  escalate_to_user_id?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkflowLog {
  id: string;
  report_id: string;
  action: string;
  details: any;
  created_at: string;
}

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

const WorkflowsView = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { organizationId: customDomainOrgId } = useCustomDomain();
  const organizationId = organization?.id || customDomainOrgId;
  const { data: workflowsEnabled, isLoading: workflowsLoading } = useFeatureFlag('workflows', organizationId);

  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);
  const [showCreatePolicyDialog, setShowCreatePolicyDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AssignmentRule | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<SLAPolicy | null>(null);
  
  // Form states for rules
  const [ruleName, setRuleName] = useState('');
  const [rulePriority, setRulePriority] = useState(0);
  const [ruleEnabled, setRuleEnabled] = useState(true);
  const [ruleCategory, setRuleCategory] = useState('any');
  const [ruleUrgency, setRuleUrgency] = useState('any');
  const [ruleKeywords, setRuleKeywords] = useState('');
  const [ruleAssignTo, setRuleAssignTo] = useState('');
  const [ruleAssignTeam, setRuleAssignTeam] = useState('');
  
  // Form states for policies
  const [policyName, setPolicyName] = useState('');
  const [policyCritical, setPolicyCritical] = useState(24);
  const [policyHigh, setPolicyHigh] = useState(48);
  const [policyMedium, setPolicyMedium] = useState(120);
  const [policyLow, setPolicyLow] = useState(240);
  const [policyEscalate, setPolicyEscalate] = useState(true);
  const [policyEscalateTo, setPolicyEscalateTo] = useState('');
  const [policyIsDefault, setPolicyIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchData();
      fetchTeamMembers();
    }
  }, [organizationId]);

  const fetchData = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      // Fetch assignment rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('assignment_rules')
        .select('*')
        .eq('organization_id', organizationId)
        .order('priority', { ascending: false });

      if (rulesError) throw rulesError;
      setRules((rulesData || []) as any);

      // Fetch SLA policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('sla_policies')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (policiesError) throw policiesError;
      setPolicies(policiesData || []);

      // Fetch workflow logs (last 50)
      const { data: logsData, error: logsError } = await supabase
        .from('workflow_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setWorkflowLogs(logsData || []);
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('email');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setRuleName('');
    setRulePriority(0);
    setRuleEnabled(true);
    setRuleCategory('any');
    setRuleUrgency('any');
    setRuleKeywords('');
    setRuleAssignTo('');
    setRuleAssignTeam('');
    setShowCreateRuleDialog(true);
  };

  const handleEditRule = (rule: AssignmentRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRulePriority(rule.priority);
    setRuleEnabled(rule.enabled);
    setRuleCategory(rule.conditions?.category || 'any');
    setRuleUrgency(rule.conditions?.urgency || 'any');
    setRuleKeywords(rule.conditions?.keywords?.join(', ') || '');
    setRuleAssignTo(rule.assign_to_user_id || '');
    setRuleAssignTeam(rule.assign_to_team || '');
    setShowCreateRuleDialog(true);
  };

  const handleSaveRule = async () => {
    if (!organizationId || !ruleName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const conditions: any = {};
      if (ruleCategory !== 'any') conditions.category = ruleCategory;
      if (ruleUrgency !== 'any') conditions.urgency = ruleUrgency;
      if (ruleKeywords.trim()) {
        conditions.keywords = ruleKeywords.split(',').map(k => k.trim()).filter(Boolean);
      }

      const ruleData: any = {
        organization_id: organizationId,
        name: ruleName,
        priority: rulePriority,
        enabled: ruleEnabled,
        conditions,
        assign_to_user_id: ruleAssignTo || null,
        assign_to_team: ruleAssignTeam || null,
        updated_at: new Date().toISOString(),
      };

      if (editingRule) {
        const { error } = await supabase
          .from('assignment_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Assignment rule updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('assignment_rules')
          .insert(ruleData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Assignment rule created successfully",
        });
      }

      setShowCreateRuleDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving rule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assignment rule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const { error } = await supabase
        .from('assignment_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Assignment rule deleted successfully",
      });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment rule",
        variant: "destructive",
      });
    }
  };

  const handleCreatePolicy = () => {
    setEditingPolicy(null);
    setPolicyName('');
    setPolicyCritical(24);
    setPolicyHigh(48);
    setPolicyMedium(120);
    setPolicyLow(240);
    setPolicyEscalate(true);
    setPolicyEscalateTo('');
    setPolicyIsDefault(false);
    setShowCreatePolicyDialog(true);
  };

  const handleEditPolicy = (policy: SLAPolicy) => {
    setEditingPolicy(policy);
    setPolicyName(policy.name);
    setPolicyCritical(policy.critical_response_time);
    setPolicyHigh(policy.high_response_time);
    setPolicyMedium(policy.medium_response_time);
    setPolicyLow(policy.low_response_time);
    setPolicyEscalate(policy.escalate_after_breach);
    setPolicyEscalateTo(policy.escalate_to_user_id || '');
    setPolicyIsDefault(policy.is_default);
    setShowCreatePolicyDialog(true);
  };

  const handleSavePolicy = async () => {
    if (!organizationId || !policyName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // If setting as default, unset other defaults first
      if (policyIsDefault) {
        await supabase
          .from('sla_policies')
          .update({ is_default: false })
          .eq('organization_id', organizationId)
          .eq('is_default', true);
      }

      const policyData: any = {
        organization_id: organizationId,
        name: policyName,
        critical_response_time: policyCritical,
        high_response_time: policyHigh,
        medium_response_time: policyMedium,
        low_response_time: policyLow,
        escalate_after_breach: policyEscalate,
        escalate_to_user_id: policyEscalateTo || null,
        is_default: policyIsDefault,
        updated_at: new Date().toISOString(),
      };

      if (editingPolicy) {
        const { error } = await supabase
          .from('sla_policies')
          .update(policyData)
          .eq('id', editingPolicy.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "SLA policy updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('sla_policies')
          .insert(policyData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "SLA policy created successfully",
        });
      }

      setShowCreatePolicyDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving policy:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save SLA policy",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      const { error } = await supabase
        .from('sla_policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "SLA policy deleted successfully",
      });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting policy:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete SLA policy",
        variant: "destructive",
      });
    }
  };

  if (workflowsLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  // Check feature flag
  if (workflowsEnabled === false) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Workflows feature is currently disabled. Please contact support if you need access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t('workflows.title')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('workflows.description')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="rules" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('workflows.assignmentRules')}</span>
              <span className="sm:hidden">{t('workflows.rules')}</span>
            </TabsTrigger>
            <TabsTrigger value="sla" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('workflows.slaPolicies')}</span>
              <span className="sm:hidden">{t('workflows.sla')}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('workflows.workflowHistory')}</span>
              <span className="sm:hidden">{t('workflows.history')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Assignment Rules Tab */}
          <TabsContent value="rules" className="mt-4 md:mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg md:text-xl">{t('workflows.assignmentRules')}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      {t('workflows.assignmentRulesDescription')}
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateRule} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('workflows.createRule')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {rules.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <Settings className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm md:text-base">{t('workflows.noRules')}</p>
                    <p className="text-xs md:text-sm mt-2">{t('workflows.createFirstRule')}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('workflows.name')}</TableHead>
                            <TableHead>{t('workflows.priority')}</TableHead>
                            <TableHead>{t('workflows.conditions')}</TableHead>
                            <TableHead>{t('workflows.assignTo')}</TableHead>
                            <TableHead>{t('workflows.status')}</TableHead>
                            <TableHead>{t('workflows.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rules.map((rule) => (
                            <TableRow key={rule.id}>
                              <TableCell className="font-medium">{rule.name}</TableCell>
                              <TableCell>{rule.priority}</TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  {rule.conditions.category && rule.conditions.category !== 'any' && (
                                    <Badge variant="outline">Category: {rule.conditions.category}</Badge>
                                  )}
                                  {rule.conditions.urgency && rule.conditions.urgency !== 'any' && (
                                    <Badge variant="outline">Urgency: {rule.conditions.urgency}</Badge>
                                  )}
                                  {rule.conditions.keywords && rule.conditions.keywords.length > 0 && (
                                    <Badge variant="outline">Keywords: {rule.conditions.keywords.join(', ')}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {rule.assign_to_user_id ? (
                                  teamMembers.find(m => m.id === rule.assign_to_user_id)?.email || 'User'
                                ) : rule.assign_to_team || '-'}
                              </TableCell>
                              <TableCell>
                                {rule.enabled ? (
                                  <Badge variant="default" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRule(rule)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRule(rule.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {rules.map((rule) => (
                        <Card key={rule.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm">{rule.name}</h3>
                                  <p className="text-xs text-muted-foreground mt-1">Priority: {rule.priority}</p>
                                </div>
                                {rule.enabled ? (
                                  <Badge variant="default" className="gap-1 text-xs">
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="gap-1 text-xs">
                                    <XCircle className="h-3 w-3" />
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('workflows.conditions')}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {rule.conditions.category && rule.conditions.category !== 'any' && (
                                      <Badge variant="outline" className="text-xs">Category: {rule.conditions.category}</Badge>
                                    )}
                                    {rule.conditions.urgency && rule.conditions.urgency !== 'any' && (
                                      <Badge variant="outline" className="text-xs">Urgency: {rule.conditions.urgency}</Badge>
                                    )}
                                    {rule.conditions.keywords && rule.conditions.keywords.length > 0 && (
                                      <Badge variant="outline" className="text-xs">Keywords: {rule.conditions.keywords.join(', ')}</Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('workflows.assignTo')}</p>
                                  <p className="text-xs">
                                    {rule.assign_to_user_id ? (
                                      teamMembers.find(m => m.id === rule.assign_to_user_id)?.email || 'User'
                                    ) : rule.assign_to_team || '-'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleEditRule(rule)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  {t('workflows.edit')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-destructive"
                                  onClick={() => handleDeleteRule(rule.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  {t('workflows.delete')}
                                </Button>
                              </div>
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

          {/* SLA Policies Tab */}
          <TabsContent value="sla" className="mt-4 md:mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg md:text-xl">{t('workflows.slaPolicies')}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      {t('workflows.slaPoliciesDescription')}
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreatePolicy} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('workflows.createPolicy')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {policies.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm md:text-base">{t('workflows.noPolicies')}</p>
                    <p className="text-xs md:text-sm mt-2">{t('workflows.createFirstPolicy')}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('workflows.name')}</TableHead>
                            <TableHead>{t('workflows.critical')}</TableHead>
                            <TableHead>{t('workflows.high')}</TableHead>
                            <TableHead>{t('workflows.medium')}</TableHead>
                            <TableHead>{t('workflows.low')}</TableHead>
                            <TableHead>{t('workflows.default')}</TableHead>
                            <TableHead>{t('workflows.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {policies.map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell className="font-medium">{policy.name}</TableCell>
                              <TableCell>{policy.critical_response_time}h</TableCell>
                              <TableCell>{policy.high_response_time}h</TableCell>
                              <TableCell>{policy.medium_response_time}h</TableCell>
                              <TableCell>{policy.low_response_time}h</TableCell>
                              <TableCell>
                                {policy.is_default ? (
                                  <Badge variant="default">Default</Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPolicy(policy)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePolicy(policy.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {policies.map((policy) => (
                        <Card key={policy.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-sm">{policy.name}</h3>
                                {policy.is_default && (
                                  <Badge variant="default" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">{t('workflows.critical')}</p>
                                  <p className="font-medium">{policy.critical_response_time}h</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">{t('workflows.high')}</p>
                                  <p className="font-medium">{policy.high_response_time}h</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">{t('workflows.medium')}</p>
                                  <p className="font-medium">{policy.medium_response_time}h</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">{t('workflows.low')}</p>
                                  <p className="font-medium">{policy.low_response_time}h</p>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleEditPolicy(policy)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  {t('workflows.edit')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-destructive"
                                  onClick={() => handleDeletePolicy(policy.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  {t('workflows.delete')}
                                </Button>
                              </div>
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

          {/* Workflow History Tab */}
          <TabsContent value="history" className="mt-4 md:mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">{t('workflows.workflowHistory')}</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {t('workflows.workflowHistoryDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflowLogs.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <History className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm md:text-base">{t('workflows.noHistory')}</p>
                    <p className="text-xs md:text-sm mt-2">{t('workflows.historyWillAppear')}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('workflows.action')}</TableHead>
                            <TableHead>{t('workflows.reportId')}</TableHead>
                            <TableHead>{t('workflows.details')}</TableHead>
                            <TableHead>{t('workflows.date')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workflowLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <Badge variant="outline">{log.action}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{log.report_id.substring(0, 8)}...</TableCell>
                              <TableCell>
                                <pre className="text-xs bg-muted p-2 rounded max-w-md overflow-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </TableCell>
                              <TableCell>
                                {new Date(log.created_at).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {workflowLogs.map((log) => (
                        <Card key={log.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <Badge variant="outline" className="text-xs">{log.action}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">{t('workflows.reportId')}</p>
                                <p className="font-mono text-xs">{log.report_id.substring(0, 8)}...</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">{t('workflows.details')}</p>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
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
      </Tabs>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingRule ? 'Edit Assignment Rule' : 'Create Assignment Rule'}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Configure automatic case assignment based on category, urgency, and keywords.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name" className="text-sm">Rule Name *</Label>
              <Input
                id="rule-name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g., Financial Misconduct → Finance Team"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-priority">Priority</Label>
                <Input
                  id="rule-priority"
                  type="number"
                  value={rulePriority}
                  onChange={(e) => setRulePriority(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">{t('workflows.priorityHelp')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-enabled">Enabled</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="rule-enabled"
                    checked={ruleEnabled}
                    onCheckedChange={setRuleEnabled}
                  />
                  <Label htmlFor="rule-enabled" className="cursor-pointer">
                    {ruleEnabled ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Conditions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-category">Category</Label>
                  <Select value={ruleCategory} onValueChange={setRuleCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Category</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-urgency">Urgency</Label>
                  <Select value={ruleUrgency} onValueChange={setRuleUrgency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Urgency</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-keywords">Keywords (comma-separated)</Label>
              <Input
                id="rule-keywords"
                value={ruleKeywords}
                onChange={(e) => setRuleKeywords(e.target.value)}
                placeholder="e.g., fraud, embezzlement, theft"
              />
              <p className="text-xs text-muted-foreground">{t('workflows.keywordsHelp')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-assign-to" className="text-sm">Assign To User</Label>
                <Select value={ruleAssignTo || undefined} onValueChange={(value) => setRuleAssignTo(value || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name && member.last_name
                          ? `${member.first_name} ${member.last_name} (${member.email})`
                          : member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-assign-team" className="text-sm">Assign To Team</Label>
                <Input
                  id="rule-assign-team"
                  value={ruleAssignTeam}
                  onChange={(e) => setRuleAssignTeam(e.target.value)}
                  placeholder="e.g., finance, legal, hr"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule} loading={saving} loadingText="Saving...">
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Policy Dialog */}
      <Dialog open={showCreatePolicyDialog} onOpenChange={setShowCreatePolicyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingPolicy ? 'Edit SLA Policy' : 'Create SLA Policy'}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Set response time targets for different priority levels (in hours).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name" className="text-sm">Policy Name *</Label>
              <Input
                id="policy-name"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g., Standard SLA Policy"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy-critical">Critical Response Time (hours)</Label>
                <Input
                  id="policy-critical"
                  type="number"
                  value={policyCritical}
                  onChange={(e) => setPolicyCritical(parseInt(e.target.value) || 24)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy-high">High Response Time (hours)</Label>
                <Input
                  id="policy-high"
                  type="number"
                  value={policyHigh}
                  onChange={(e) => setPolicyHigh(parseInt(e.target.value) || 48)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy-medium">Medium Response Time (hours)</Label>
                <Input
                  id="policy-medium"
                  type="number"
                  value={policyMedium}
                  onChange={(e) => setPolicyMedium(parseInt(e.target.value) || 120)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy-low">Low Response Time (hours)</Label>
                <Input
                  id="policy-low"
                  type="number"
                  value={policyLow}
                  onChange={(e) => setPolicyLow(parseInt(e.target.value) || 240)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="policy-escalate"
                  checked={policyEscalate}
                  onCheckedChange={setPolicyEscalate}
                />
                <Label htmlFor="policy-escalate" className="cursor-pointer">
                  Escalate after SLA breach
                </Label>
              </div>
            </div>
            {policyEscalate && (
              <div className="space-y-2">
                <Label htmlFor="policy-escalate-to" className="text-sm">Escalate To User</Label>
                <Select value={policyEscalateTo || undefined} onValueChange={(value) => setPolicyEscalateTo(value || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name && member.last_name
                          ? `${member.first_name} ${member.last_name} (${member.email})`
                          : member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="policy-default"
                  checked={policyIsDefault}
                  onCheckedChange={setPolicyIsDefault}
                />
                <Label htmlFor="policy-default" className="cursor-pointer">
                  Set as default policy
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Only one policy can be the default per organization
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePolicyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} loading={saving} loadingText="Saving...">
              {editingPolicy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowsView;
