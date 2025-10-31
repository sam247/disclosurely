import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';

interface PendingPolicy {
  assignment_id: string;
  policy_id: string;
  policy_name: string;
  policy_type: string;
  current_version: number;
  assigned_at: string;
  due_date: string | null;
  policy_description: string | null;
  policy_content: string | null;
  status: 'pending' | 'due_soon' | 'overdue';
}

interface AcknowledgedPolicy {
  id: string;
  policy_name: string;
  policy_type: string;
  policy_version: number;
  acknowledged_at: string;
  policy_description: string | null;
}

export default function PolicyAcknowledgment() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [pendingPolicies, setPendingPolicies] = useState<PendingPolicy[]>([]);
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState<AcknowledgedPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PendingPolicy | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  useEffect(() => {
    if (organization?.id) {
      loadPolicies();
    }
  }, [organization?.id]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Load pending policies
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_policy_acknowledgments')
        .select('*, compliance_policies(policy_description, policy_content)')
        .eq('organization_id', organization?.id)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (pendingError) throw pendingError;

      const pending = pendingData?.map((p: any) => ({
        assignment_id: p.assignment_id,
        policy_id: p.policy_id,
        policy_name: p.policy_name,
        policy_type: p.policy_type,
        current_version: p.current_version,
        assigned_at: p.assigned_at,
        due_date: p.due_date,
        status: p.status,
        policy_description: p.compliance_policies?.policy_description,
        policy_content: p.compliance_policies?.policy_content
      })) || [];

      setPendingPolicies(pending);

      // Load acknowledged policies
      const { data: ackData, error: ackError } = await supabase
        .from('policy_acknowledgments')
        .select('id, policy_id, policy_version, acknowledged_at, compliance_policies(policy_name, policy_type, policy_description)')
        .eq('organization_id', organization?.id)
        .eq('user_id', user.id)
        .order('acknowledged_at', { ascending: false });

      if (ackError) throw ackError;

      const acknowledged = ackData?.map((a: any) => ({
        id: a.id,
        policy_name: a.compliance_policies?.policy_name,
        policy_type: a.compliance_policies?.policy_type,
        policy_version: a.policy_version,
        acknowledged_at: a.acknowledged_at,
        policy_description: a.compliance_policies?.policy_description
      })) || [];

      setAcknowledgedPolicies(acknowledged);
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

  const handleAcknowledge = async () => {
    if (!selectedPolicy || !signatureName.trim()) {
      toast({
        title: 'Signature Required',
        description: 'Please enter your full name to acknowledge this policy.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setAcknowledging(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('policy_acknowledgments')
        .insert({
          organization_id: organization?.id,
          policy_id: selectedPolicy.policy_id,
          policy_version: selectedPolicy.current_version,
          user_id: user.id,
          signature_data: {
            name: signatureName,
            timestamp: new Date().toISOString(),
            ip: 'client' // IP will be captured server-side if needed
          }
        });

      if (error) throw error;

      toast({
        title: 'Policy Acknowledged',
        description: `You have successfully acknowledged "${selectedPolicy.policy_name}".`
      });

      // Reload policies
      await loadPolicies();

      // Close dialog
      setIsAcknowledgeDialogOpen(false);
      setSelectedPolicy(null);
      setSignatureName('');
    } catch (error) {
      console.error('Error acknowledging policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to acknowledge policy. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAcknowledging(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'due_soon':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Due Soon</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      data_privacy: 'Data Privacy',
      security: 'Security',
      hr: 'HR',
      financial: 'Financial',
      compliance: 'Compliance',
      operational: 'Operational',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
        <h1 className="text-3xl font-bold">Policy Acknowledgments</h1>
        <p className="text-muted-foreground mt-2">
          Review and acknowledge policies assigned to you
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingPolicies.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {pendingPolicies.filter(p => p.status === 'overdue').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                  <p className="text-2xl font-bold text-green-600">{acknowledgedPolicies.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="pending">
              Pending ({pendingPolicies.length})
            </TabsTrigger>
            <TabsTrigger value="acknowledged">
              Acknowledged ({acknowledgedPolicies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingPolicies.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">All Caught Up!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You have no pending policy acknowledgments.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingPolicies.map((policy) => (
                <Card key={policy.assignment_id} className={policy.status === 'overdue' ? 'border-red-300' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle>{policy.policy_name}</CardTitle>
                          {getStatusBadge(policy.status)}
                        </div>
                        <CardDescription className="mt-2">
                          {policy.policy_description || 'No description available'}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{getTypeBadge(policy.policy_type)}</Badge>
                      <span>Version {policy.current_version}</span>
                      {policy.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {format(new Date(policy.due_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setIsAcknowledgeDialogOpen(true);
                      }}
                      className="w-full"
                      variant={policy.status === 'overdue' ? 'destructive' : 'default'}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Review & Acknowledge Policy
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="acknowledged" className="space-y-4 mt-6">
            {acknowledgedPolicies.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No History</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You haven't acknowledged any policies yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              acknowledgedPolicies.map((policy) => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <CardTitle>{policy.policy_name}</CardTitle>
                      </div>
                      <Badge variant="outline">{getTypeBadge(policy.policy_type)}</Badge>
                    </div>
                    <CardDescription>
                      {policy.policy_description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Version {policy.policy_version}</span>
                        <span>•</span>
                        <span>Acknowledged on {format(new Date(policy.acknowledged_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Acknowledgment Dialog */}
      <Dialog open={isAcknowledgeDialogOpen} onOpenChange={setIsAcknowledgeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedPolicy?.policy_name}
            </DialogTitle>
            <DialogDescription>
              Please review this policy carefully before acknowledging
            </DialogDescription>
          </DialogHeader>

          {selectedPolicy && (
            <div className="space-y-6">
              {/* Policy Details */}
              <div className="flex items-center gap-4">
                <Badge variant="outline">{getTypeBadge(selectedPolicy.policy_type)}</Badge>
                <span className="text-sm text-muted-foreground">Version {selectedPolicy.current_version}</span>
                {selectedPolicy.due_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {format(new Date(selectedPolicy.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Policy Content */}
              {selectedPolicy.policy_content ? (
                <div>
                  <Label className="text-sm font-medium">Policy Content</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                    {selectedPolicy.policy_content}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Policy content is not available. Please contact your administrator.
                  </AlertDescription>
                </Alert>
              )}

              {/* Digital Signature */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <Label className="text-base font-medium">Digital Acknowledgment</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  By entering your name below, you acknowledge that you have read, understood, and agree to comply with this policy.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="signature">Full Name *</Label>
                  <Input
                    id="signature"
                    placeholder="Enter your full name"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAcknowledgeDialogOpen(false);
                setSignatureName('');
              }}
              disabled={acknowledging}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAcknowledge}
              disabled={acknowledging || !signatureName.trim()}
            >
              {acknowledging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Acknowledging...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  I Acknowledge This Policy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

