
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { auditLogger } from '@/utils/auditLogger';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  CheckCircle,
  XCircle,
  Trash2,
  UserCheck
} from 'lucide-react';

import { useUserRoles, UserRole } from '@/hooks/useUserRoles';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  roles: UserRole[];
}

interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  invited_by_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

const UserManagement = () => {
  const { user, subscriptionData } = useAuth();
  const { organization, profile } = useOrganization();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('case_handler');
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [cancellingInvitation, setCancellingInvitation] = useState<string | null>(null);
  const { isOrgAdmin } = useUserRoles();
  const { limits } = useSubscriptionLimits();

  useEffect(() => {
    if (organization && isOrgAdmin) {
      fetchTeamMembers();
      fetchInvitations();
    }
  }, [organization, isOrgAdmin]);

  const fetchTeamMembers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each member
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('organization_id', organization?.id)
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const membersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        roles: (userRoles || [])
          .filter(ur => ur.user_id === profile.id)
          .map(ur => ur.role as UserRole)
      }));

      setTeamMembers(membersWithRoles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          *,
          invited_by_profile:profiles!user_invitations_invited_by_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', organization?.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invitations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvitation = async () => {
    
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!organization) {
      toast({
        title: "Error",
        description: "Organization not found. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User session not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!isOrgAdmin) {
      toast({
        title: "Error",
        description: "Only organization administrators can send invitations.",
        variant: "destructive",
      });
      return;
    }

    // Check team member limit
    const currentTeamCount = teamMembers.length;
    const pendingInvitationsCount = invitations.length;
    const totalTeamSize = currentTeamCount + pendingInvitationsCount;
    
    if (limits.maxTeamMembers > 0 && totalTeamSize >= limits.maxTeamMembers) {
      toast({
        title: "Team Limit Reached",
        description: `Your ${subscriptionData?.subscription_tier || 'subscription'} plan allows up to ${limits.maxTeamMembers} team members. Please upgrade to add more members.`,
        variant: "destructive",
      });
      return;
    }

    
    setIsSendingInvitation(true);
    try {
      const emailToInvite = inviteEmail.toLowerCase().trim();
      
      // Check for existing invitations
      const { data: existingInvitations, error: checkError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('email', emailToInvite);

      if (checkError) throw checkError;

      // Check if user is already a team member (more comprehensive check)
      const { data: existingMember, error: memberError } = await supabase
        .from('profiles')
        .select('id, email, is_active')
        .eq('organization_id', organization.id)
        .eq('email', emailToInvite)
        .eq('is_active', true);

      if (memberError && memberError.code !== 'PGRST116') throw memberError;

      if (existingMember && existingMember.length > 0) {
        // Check if they have active roles
        const { data: activeRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, is_active')
          .eq('user_id', existingMember[0].id)
          .eq('is_active', true);

        if (!rolesError && activeRoles && activeRoles.length > 0) {
          toast({
            title: "User Already Exists",
            description: `${emailToInvite} is already an active team member.`,
            variant: "destructive",
          });
          return;
        }
      }

      // If there's an existing invitation, handle it appropriately
      if (existingInvitations && existingInvitations.length > 0) {
        const existingInvitation = existingInvitations[0];
        
        if (existingInvitation.accepted_at) {
          // Invitation was already accepted - user is already a team member
          toast({
            title: "User Already Exists",
            description: `${emailToInvite} has already accepted an invitation and is a team member.`,
            variant: "destructive",
          });
          return;
        } else {
          // Invitation exists but not accepted - delete it and create new one
          const { error: deleteError } = await supabase
            .from('user_invitations')
            .delete()
            .eq('organization_id', organization.id)
            .eq('email', emailToInvite);

          if (deleteError) throw deleteError;
        }
      }

      // Insert new invitation without token - the trigger will generate it
      const { data: newInvitation, error } = await supabase
        .from('user_invitations')
        .insert({
          organization_id: organization.id,
          email: emailToInvite,
          role: inviteRole,
          invited_by: user.id,
          token: '', // This will be replaced by the trigger
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        if (error.code === '23505') {
          toast({
            title: "Invitation Already Exists",
            description: "An invitation has already been sent to this email address. Please wait for it to expire or cancel the existing invitation first.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: { invitationId: newInvitation.id },
      });

      if (emailError) {
        toast({
          title: "Invitation created",
          description: "Invitation created but email failed to send. Please resend manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invitation sent",
          description: `Invitation email sent to ${inviteEmail}`,
        });
      }

      // Log team invitation to audit trail
      await auditLogger.log({
        eventType: 'user.invite',
        category: 'user_management',
        action: 'Team member invited',
        severity: 'medium',
        actorType: 'user',
        actorId: user.id,
        actorEmail: user.email,
        targetType: 'user',
        targetId: newInvitation.id,
        targetName: emailToInvite,
        summary: `Team invitation sent to ${emailToInvite}`,
        description: `Invitation sent for ${inviteRole} role`,
        metadata: {
          invited_email: emailToInvite,
          invited_role: inviteRole,
          invitation_id: newInvitation.id,
        },
        organizationId: organization.id,
      });

      setInviteEmail('');
      setInviteRole('case_handler');
      setIsInviteDialogOpen(false);
      await fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    setCancellingInvitation(invitationId);
    try {
      const invitation = invitations.find(i => i.id === invitationId);
      
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      // Log cancellation to audit trail
      if (invitation && organization?.id) {
        await auditLogger.log({
          eventType: 'user.invite_cancelled',
          category: 'user_management',
          action: 'Invitation cancelled',
          severity: 'low',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'user',
          targetId: invitationId,
          targetName: invitation.email,
          summary: `Invitation cancelled for ${invitation.email}`,
          description: `Cancelled ${invitation.role} invitation`,
          metadata: {
            cancelled_email: invitation.email,
            cancelled_role: invitation.role,
          },
          organizationId: organization.id,
        });
      }

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });

      await fetchInvitations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    } finally {
      setCancellingInvitation(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const member = teamMembers.find(m => m.id === userId);
      const oldRole = member?.roles[0] || 'none';

      // Insert or update role in user_roles table
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organization?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ 
            role: newRole as any,
            granted_by: user?.id,
            granted_at: new Date().toISOString(),
            is_active: true
          })
          .eq('id', existingRole.id);

        if (updateError) throw updateError;
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: userId,
            organization_id: organization?.id!,
            role: newRole as any,
            granted_by: user?.id,
            is_active: true
          }]);

        if (insertError) throw insertError;
      }

      // Log role change to audit trail
      if (member && organization?.id) {
        await auditLogger.log({
          eventType: 'user.role_change',
          category: 'user_management',
          action: 'User role updated',
          severity: 'high',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'user',
          targetId: userId,
          targetName: member.email,
          summary: `User role changed from ${oldRole} to ${newRole}`,
          description: `Role updated for ${member.email}`,
          beforeState: { role: oldRole },
          afterState: { role: newRole },
          metadata: {
            target_user_email: member.email,
            old_role: oldRole,
            new_role: newRole,
          },
          organizationId: organization.id,
        });
      }

      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });

      await fetchTeamMembers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      const member = teamMembers.find(m => m.id === userId);
      
      // Deactivate user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Deactivate all user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Clean up any pending invitations for this user
      const { error: invitationError } = await supabase
        .from('user_invitations')
        .delete()
        .eq('email', member.email)
        .eq('organization_id', organization.id);

      if (invitationError) {
        // Don't throw here - invitation cleanup is not critical
      }

      // Log deactivation to audit trail
      if (member && organization?.id) {
        await auditLogger.log({
          eventType: 'user.deactivate',
          category: 'user_management',
          action: 'User deactivated',
          severity: 'high',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: user?.email,
          targetType: 'user',
          targetId: userId,
          targetName: member.email,
          summary: `User ${member.email} deactivated`,
          description: `User account and roles deactivated by ${user?.email}`,
          beforeState: { is_active: true },
          afterState: { is_active: false },
          metadata: {
            target_user_email: member.email,
            target_user_roles: member.roles,
          },
          organizationId: organization.id,
        });
      }

      toast({
        title: "User deactivated",
        description: "User has been deactivated",
      });

      await fetchTeamMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'org_admin': return 'bg-purple-100 text-purple-800';
      case 'case_handler': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isOrgAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              You need Organization Admin privileges to manage users.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading team members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Team Members</span>
              </CardTitle>
              <CardDescription>
                Manage your organization's team members and their roles
              </CardDescription>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Invite User</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] sm:max-w-lg md:!max-w-[800px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => {
                        
                        setInviteEmail(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: UserRole) => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="case_handler">Case Handler</SelectItem>
                        <SelectItem value="org_admin">Org Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsInviteDialogOpen(false);
                      }}
                      className="transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        sendInvitation();
                      }} 
                      loading={isSendingInvitation}
                      loadingText="Sending..."
                      disabled={!inviteEmail.trim()}
                      className="transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[120px]">Role</TableHead>
                  <TableHead className="w-[100px]">Last Login</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.first_name ? member.first_name[0].toUpperCase() : 
                               member.email ? member.email[0].toUpperCase() : '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {member.first_name && member.last_name 
                                ? `${member.first_name} ${member.last_name}`
                                : 'Not provided'
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {member.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm break-words">{member.email}</div>
                        <div className="text-xs text-gray-500">
                          {member.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.roles.length > 0 ? (
                          <Badge className={`${getRoleColor(member.roles[0])} text-xs`}>
                            {formatRole(member.roles[0])}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            No Role
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {member.last_login 
                          ? new Date(member.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {member.id !== user?.id && (
                            <>
                              <Select
                                value={member.roles[0] || 'case_handler'}
                                onValueChange={(value: UserRole) => updateUserRole(member.id, value)}
                              >
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="case_handler">Case Handler</SelectItem>
                                  <SelectItem value="org_admin">Org Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deactivateUser(member.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Deactivate user"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {member.id === user?.id && (
                            <span className="text-xs text-gray-400 italic">You</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No team members found
              </div>
            ) : (
              teamMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {member.first_name ? member.first_name[0].toUpperCase() : 
                           member.email ? member.email[0].toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm break-words">
                          {member.first_name && member.last_name 
                            ? `${member.first_name} ${member.last_name}`
                            : 'Not provided'
                          }
                        </div>
                        <div className="text-xs text-gray-500 break-all mt-1">
                          {member.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {member.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex flex-col gap-2">
                        {member.roles.length > 0 ? (
                          <Badge className={`${getRoleColor(member.roles[0])} text-xs w-fit`}>
                            {formatRole(member.roles[0])}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 text-xs w-fit">
                            No Role
                          </Badge>
                        )}
                        <div className="text-xs text-gray-500">
                          Last login: {member.last_login 
                            ? new Date(member.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </div>
                      
                      {member.id !== user?.id && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={member.roles[0] || 'case_handler'}
                            onValueChange={(value: UserRole) => updateUserRole(member.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="case_handler">Case Handler</SelectItem>
                              <SelectItem value="org_admin">Org Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deactivateUser(member.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Deactivate user"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {member.id === user?.id && (
                        <span className="text-xs text-gray-400 italic">You</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <span>Pending Invitations</span>
            </CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(invitation.role)}>
                          {formatRole(invitation.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invitation.invited_by_profile 
                          ? (
                              (invitation.invited_by_profile.first_name || invitation.invited_by_profile.last_name)
                                ? `${invitation.invited_by_profile.first_name ?? ''} ${invitation.invited_by_profile.last_name ?? ''}`.trim()
                                : invitation.invited_by_profile.email
                            )
                          : 'Unknown'
                        }
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelInvitation(invitation.id)}
                          disabled={cancellingInvitation === invitation.id}
                          className="text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          {cancellingInvitation === invitation.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
