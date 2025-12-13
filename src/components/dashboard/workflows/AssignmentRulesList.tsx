import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { AssignmentRule } from '@/types/workflow';
import { AssignmentRuleModal } from './AssignmentRuleModal';

export function AssignmentRulesList() {
  const [selectedRule, setSelectedRule] = useState<AssignmentRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user's organization
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch assignment rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['assignment-rules', userProfile?.organization_id],
    queryFn: async () => {
      if (!userProfile?.organization_id) return [];

      const { data, error } = await supabase
        .from('assignment_rules')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as AssignmentRule[];
    },
    enabled: !!userProfile?.organization_id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('assignment_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-rules'] });
      toast({
        title: 'Rule Deleted',
        description: 'Assignment rule has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (rule: AssignmentRule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedRule(null);
    setIsModalOpen(true);
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this assignment rule?')) {
      deleteMutation.mutate(ruleId);
    }
  };

  const getUrgencyBadge = (urgency?: string) => {
    if (!urgency || urgency === 'any') return null;

    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'default',
    };

    return (
      <Badge variant={variants[urgency] || 'default'} className="capitalize">
        {urgency}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading assignment rules...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Rules</h2>
          <p className="text-sm text-muted-foreground">
            Automatically assign reports based on conditions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {!rules || rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No assignment rules configured yet.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <Badge variant="outline" className="font-mono text-xs">
                          Priority {rule.priority}
                        </Badge>
                        {!rule.enabled && (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {rule.conditions.category && rule.conditions.category !== 'any' && (
                            <Badge variant="outline" className="capitalize">
                              {rule.conditions.category}
                            </Badge>
                          )}
                          {getUrgencyBadge(rule.conditions.urgency)}
                          {rule.conditions.keywords && rule.conditions.keywords.length > 0 && (
                            <Badge variant="outline">
                              Keywords: {rule.conditions.keywords.join(', ')}
                            </Badge>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <AssignmentRuleModal
        rule={selectedRule}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        organizationId={userProfile?.organization_id}
      />
    </div>
  );
}
