import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { Users, Calendar, Loader2, CheckCircle2 } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface PolicyAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  policyId: string;
  policyName: string;
  onAssignmentComplete?: () => void;
}

export function PolicyAssignmentDialog({
  isOpen,
  onClose,
  policyId,
  policyName,
  onAssignmentComplete
}: PolicyAssignmentDialogProps) {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState<string>(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [existingAssignments, setExistingAssignments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && organization?.id) {
      loadTeamMembers();
      loadExistingAssignments();
    }
  }, [isOpen, organization?.id]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('organization_id', organization?.id)
        .order('first_name', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_assignments')
        .select('user_id')
        .eq('policy_id', policyId);

      if (error) throw error;
      const assignedUsers = new Set(data?.map(a => a.user_id) || []);
      setExistingAssignments(assignedUsers);
      setSelectedMembers(assignedUsers);
    } catch (error) {
      console.error('Error loading existing assignments:', error);
    }
  };

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleAssign = async () => {
    if (selectedMembers.size === 0) {
      toast({
        title: 'No Members Selected',
        description: 'Please select at least one team member.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setAssigning(true);

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete unassignments (users that were unchecked)
      const toUnassign = Array.from(existingAssignments).filter(id => !selectedMembers.has(id));
      if (toUnassign.length > 0) {
        const { error: deleteError } = await supabase
          .from('policy_assignments')
          .delete()
          .eq('policy_id', policyId)
          .in('user_id', toUnassign);

        if (deleteError) throw deleteError;
      }

      // Create new assignments (users that weren't previously assigned)
      const toAssign = Array.from(selectedMembers).filter(id => !existingAssignments.has(id));
      if (toAssign.length > 0) {
        const assignments = toAssign.map(userId => ({
          organization_id: organization?.id,
          policy_id: policyId,
          user_id: userId,
          assigned_by: user.id,
          due_date: dueDate ? new Date(dueDate).toISOString() : null
        }));

        const { error: insertError } = await supabase
          .from('policy_assignments')
          .insert(assignments);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Policy Assigned',
        description: `Policy assigned to ${selectedMembers.size} team member(s).`
      });

      onAssignmentComplete?.();
      onClose();
    } catch (error) {
      console.error('Error assigning policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign policy. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  const getDisplayName = (member: TeamMember) => {
    if (member.first_name && member.last_name) {
      return `${member.first_name} ${member.last_name}`;
    }
    return member.email;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assign Policy
          </DialogTitle>
          <DialogDescription>
            Assign "{policyName}" to team members for acknowledgment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Acknowledgment Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-xs text-muted-foreground">
              Team members will be asked to acknowledge this policy by this date
            </p>
          </div>

          {/* Team Members Selection */}
          <div className="space-y-2">
            <Label>Select Team Members</Label>
            <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No team members found. Add team members first.
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="select-all"
                      checked={selectedMembers.size === teamMembers.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers(new Set(teamMembers.map(m => m.id)));
                        } else {
                          setSelectedMembers(new Set());
                        }
                      }}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Select All ({teamMembers.length})
                    </label>
                  </div>

                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.id}
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={() => toggleMember(member.id)}
                      />
                      <label
                        htmlFor={member.id}
                        className="text-sm flex items-center gap-2 flex-1 py-2 cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{getDisplayName(member)}</div>
                          {member.first_name && <div className="text-xs text-muted-foreground">{member.email}</div>}
                        </div>
                        {existingAssignments.has(member.id) && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMembers.size} member(s) selected
              {existingAssignments.size > 0 && ` • ${existingAssignments.size} already assigned`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={assigning || selectedMembers.size === 0}>
            {assigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign to ${selectedMembers.size} Member(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

