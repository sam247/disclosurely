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
import type { AssignmentRule } from '@/types/workflow';

interface AssignmentRuleModalProps {
  rule: AssignmentRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
}

export function AssignmentRuleModal({
  rule,
  open,
  onOpenChange,
  organizationId,
}: AssignmentRuleModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    priority: 100,
    enabled: true,
    category: 'any',
    urgency: 'any',
    keywords: '',
    assign_to_user_id: '',
  });

  // Fetch organization members for assignment dropdown
  const { data: members } = useQuery({
    queryKey: ['org-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId && open,
  });

  // Reset form when rule changes or modal opens
  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        priority: rule.priority,
        enabled: rule.enabled,
        category: rule.conditions.category || 'any',
        urgency: rule.conditions.urgency || 'any',
        keywords: rule.conditions.keywords?.join(', ') || '',
        assign_to_user_id: rule.assign_to_user_id || '',
      });
    } else {
      setFormData({
        name: '',
        priority: 100,
        enabled: true,
        category: 'any',
        urgency: 'any',
        keywords: '',
        assign_to_user_id: '',
      });
    }
  }, [rule, open]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error('Organization ID required');

      const conditions = {
        category: formData.category === 'any' ? undefined : formData.category,
        urgency: formData.urgency === 'any' ? undefined : formData.urgency,
        keywords: formData.keywords
          ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : undefined,
      };

      const payload = {
        organization_id: organizationId,
        name: formData.name,
        priority: formData.priority,
        enabled: formData.enabled,
        conditions,
        assign_to_user_id: formData.assign_to_user_id || null,
        updated_at: new Date().toISOString(),
      };

      if (rule) {
        // Update existing rule
        const { error } = await supabase
          .from('assignment_rules')
          .update(payload)
          .eq('id', rule.id);

        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('assignment_rules')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-rules'] });
      toast({
        title: rule ? 'Rule Updated' : 'Rule Created',
        description: `Assignment rule has been ${rule ? 'updated' : 'created'} successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Rule name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.assign_to_user_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a user to assign reports to',
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
            {rule ? 'Edit Assignment Rule' : 'Create Assignment Rule'}
          </DialogTitle>
          <DialogDescription>
            Define conditions to automatically assign incoming reports
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Financial Reports to Finance Team"
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority (higher numbers are evaluated first)
            </Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value, 10) })
              }
              min={0}
              max={1000}
            />
            <p className="text-xs text-muted-foreground">
              Rules with higher priority are checked first
            </p>
          </div>

          {/* Conditions Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Conditions (all must match)</h3>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Category</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="hr">HR / Employment</SelectItem>
                  <SelectItem value="safety">Safety / Health</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="conflict_of_interest">
                    Conflict of Interest
                  </SelectItem>
                  <SelectItem value="data_breach">Data Breach</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) =>
                  setFormData({ ...formData, urgency: value })
                }
              >
                <SelectTrigger id="urgency">
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

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                placeholder="e.g., fraud, embezzlement, theft"
              />
              <p className="text-xs text-muted-foreground">
                Report must contain at least one of these keywords
              </p>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Assignment</h3>

            <div className="space-y-2">
              <Label htmlFor="assign_to">Assign To *</Label>
              <Select
                value={formData.assign_to_user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, assign_to_user_id: value })
                }
              >
                <SelectTrigger id="assign_to">
                  <SelectValue placeholder="Select a team member" />
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
          </div>

          {/* Enabled Switch */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Rule</Label>
              <p className="text-sm text-muted-foreground">
                Disabled rules won't be applied to new reports
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked })
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
                : rule
                ? 'Update Rule'
                : 'Create Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
