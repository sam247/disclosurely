import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { SLAPolicy } from '@/types/workflow';
import { SLAPolicyModal } from '@/components/dashboard/workflows/SLAPolicyModal';

export function SLAPoliciesList() {
  const [selectedPolicy, setSelectedPolicy] = useState<SLAPolicy | null>(null);
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

  // Fetch SLA policies
  const { data: policies, isLoading } = useQuery({
    queryKey: ['sla-policies', userProfile?.organization_id],
    queryFn: async () => {
      if (!userProfile?.organization_id) return [];

      const { data, error } = await supabase
        .from('sla_policies')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SLAPolicy[];
    },
    enabled: !!userProfile?.organization_id,
  });

  const handleEdit = (policy: SLAPolicy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPolicy(null);
    setIsModalOpen(true);
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading SLA policies...</div>;
  }

  const defaultPolicy = policies?.find((p) => p.is_default);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SLA Policies</h2>
          <p className="text-sm text-muted-foreground">
            Configure response time expectations
          </p>
        </div>
        {!defaultPolicy && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        )}
      </div>

      {!policies || policies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No SLA policy configured yet.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              SLA policies define response time expectations based on report priority.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create SLA Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      {policy.is_default && (
                        <Badge>Default</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {policy.escalate_after_breach
                        ? 'Auto-escalates when SLA is breached'
                        : 'No automatic escalation'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(policy)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Critical */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Critical
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatHours(policy.critical_response_time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Response time
                    </p>
                  </div>

                  {/* High */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs bg-orange-500">
                        High
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatHours(policy.high_response_time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Response time
                    </p>
                  </div>

                  {/* Medium */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Medium
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatHours(policy.medium_response_time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Response time
                    </p>
                  </div>

                  {/* Low */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Low
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatHours(policy.low_response_time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Response time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SLAPolicyModal
        policy={selectedPolicy}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        organizationId={userProfile?.organization_id}
      />
    </div>
  );
}
