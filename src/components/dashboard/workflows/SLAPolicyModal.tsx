import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import type { SLAPolicy } from '@/types/workflow';

interface SLAPolicyModalProps {
  policy: SLAPolicy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
}

export function SLAPolicyModal({
  policy,
  open,
  onOpenChange,
  organizationId,
}: SLAPolicyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    critical_response_time: 24,
    high_response_time: 48,
    medium_response_time: 120,
    low_response_time: 240,
    escalate_after_breach: true,
    escalate_to_user_id: '',
    is_default: true,
  });

  // Fetch organization members for escalation dropdown
  const { data: members } = useQuery({
    queryKey: ['org-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, user_roles!inner(role)')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .in('user_roles.role', ['admin', 'org_admin'])
        .order('first_name');

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId && open,
  });

  // Reset form when policy changes or modal opens
  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name,
        critical_response_time: policy.critical_response_time,
        high_response_time: policy.high_response_time,
        medium_response_time: policy.medium_response_time,
        low_response_time: policy.low_response_time,
        escalate_after_breach: policy.escalate_after_breach,
        escalate_to_user_id: policy.escalate_to_user_id || '',
        is_default: policy.is_default,
      });
    } else {
      setFormData({
        name: 'Default SLA Policy',
        critical_response_time: 24,
        high_response_time: 48,
        medium_response_time: 120,
        low_response_time: 240,
        escalate_after_breach: true,
        escalate_to_user_id: '',
        is_default: true,
      });
    }
  }, [policy, open]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error('Organization ID required');

      const payload = {
        organization_id: organizationId,
        name: formData.name,
        critical_response_time: formData.critical_response_time,
        high_response_time: formData.high_response_time,
        medium_response_time: formData.medium_response_time,
        low_response_time: formData.low_response_time,
        escalate_after_breach: formData.escalate_after_breach,
        escalate_to_user_id: formData.escalate_to_user_id || null,
        is_default: formData.is_default,
        updated_at: new Date().toISOString(),
      };

      if (policy) {
        // Update existing policy
        const { error } = await supabase
          .from('sla_policies')
          .update(payload)
          .eq('id', policy.id);

        if (error) throw error;

        // If setting as default, unset other policies
        if (formData.is_default) {
          await supabase
            .from('sla_policies')
            .update({ is_default: false })
            .eq('organization_id', organizationId)
            .neq('id', policy.id);
        }
      } else {
        // Create new policy
        const { error } = await supabase
          .from('sla_policies')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        // If setting as default, unset other policies
        if (formData.is_default) {
          await supabase
            .from('sla_policies')
            .update({ is_default: false })
            .eq('organization_id', organizationId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-policies'] });
      toast({
        title: policy ? 'Policy Updated' : 'Policy Created',
        description: `SLA policy has been ${policy ? 'updated' : 'created'} successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save policy: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Policy name is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.escalate_after_breach && !formData.escalate_to_user_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a user to escalate to when SLA is breached',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {policy ? 'Edit SLA Policy' : 'Create SLA Policy'}
          </DialogTitle>
          <DialogDescription>
            Define response time expectations based on report priority
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Policy Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Policy Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Standard SLA Policy"
              required
            />
          </div>

          {/* Response Times */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Response Time Targets (in hours)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Critical */}
              <div className="space-y-2">
                <Label htmlFor="critical">Critical Priority</Label>
                <Input
                  id="critical"
                  type="number"
                  value={formData.critical_response_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      critical_response_time: parseInt(e.target.value, 10),
                    })
                  }
                  min={1}
                  max={720}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Default: 24 hours (1 day)
                </p>
              </div>

              {/* High */}
              <div className="space-y-2">
                <Label htmlFor="high">High Priority</Label>
                <Input
                  id="high"
                  type="number"
                  value={formData.high_response_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      high_response_time: parseInt(e.target.value, 10),
                    })
                  }
                  min={1}
                  max={720}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Default: 48 hours (2 days)
                </p>
              </div>

              {/* Medium */}
              <div className="space-y-2">
                <Label htmlFor="medium">Medium Priority</Label>
                <Input
                  id="medium"
                  type="number"
                  value={formData.medium_response_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medium_response_time: parseInt(e.target.value, 10),
                    })
                  }
                  min={1}
                  max={720}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Default: 120 hours (5 days)
                </p>
              </div>

              {/* Low */}
              <div className="space-y-2">
                <Label htmlFor="low">Low Priority</Label>
                <Input
                  id="low"
                  type="number"
                  value={formData.low_response_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      low_response_time: parseInt(e.target.value, 10),
                    })
                  }
                  min={1}
                  max={720}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Default: 240 hours (10 days)
                </p>
              </div>
            </div>
          </div>

          {/* Escalation Settings */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Escalation Settings</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_escalate">Auto-escalate on SLA breach</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically reassign reports when SLA deadline is missed
                </p>
              </div>
              <Switch
                id="auto_escalate"
                checked={formData.escalate_after_breach}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, escalate_after_breach: checked })
                }
              />
            </div>

            {formData.escalate_after_breach && (
              <div className="space-y-2">
                <Label htmlFor="escalate_to">Escalate To *</Label>
                <Select
                  value={formData.escalate_to_user_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, escalate_to_user_id: value })
                  }
                >
                  <SelectTrigger id="escalate_to">
                    <SelectValue placeholder="Select an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Default Policy Switch */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_default">Set as Default Policy</Label>
              <p className="text-sm text-muted-foreground">
                This policy will be applied to all new reports
              </p>
            </div>
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_default: checked })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Saving...'
                : policy
                ? 'Update Policy'
                : 'Create Policy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
