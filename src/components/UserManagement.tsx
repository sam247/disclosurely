
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
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';

type UserRole = 'admin' | 'case_handler' | 'reviewer' | 'org_admin';

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
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
  const { user } = useAuth();
  const { organization, profile } = useOrganization();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('case_handler');

  useEffect(() => {
    if (organization && profile?.role === 'org_admin') {
      fetchTeamMembers();
      fetchInvitations();
    }
  }, [organization, profile?.role]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
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
      console.error('Error fetching invitations:', error);
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
    console.log('Send invitation clicked', { inviteEmail, organization: organization?.id, userId: user?.id });
    
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

    console.log('Proceeding with invitation insert');
    
    try {
      // Insert invitation without token - the trigger will generate it
      const { data: newInvitation, error } = await supabase
        .from('user_invitations')
        .insert({
          organization_id: organization.id,
          email: inviteEmail.toLowerCase().trim(),
          role: inviteRole,
          invited_by: user.id,
          token: '', // This will be replaced by the trigger
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: { invitationId: newInvitation.id },
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
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

      setInviteEmail('');
      setInviteRole('case_handler');
      setIsInviteDialogOpen(false);
      await fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "This email has already been invited",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send invitation",
          variant: "destructive",
        });
      }
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });

      await fetchInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User deactivated",
        description: "User has been deactivated",
      });

      await fetchTeamMembers();
    } catch (error) {
      console.error('Error deactivating user:', error);
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
      case 'admin': return 'bg-red-100 text-red-800';
      case 'case_handler': return 'bg-blue-100 text-blue-800';
      case 'reviewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (profile?.role !== 'org_admin') {
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
              <DialogContent>
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
                        console.log('Email input changed:', e.target.value);
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
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="org_admin">Organization Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('Cancel button clicked');
                        setIsInviteDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        console.log('Send invitation button clicked, disabled:', !inviteEmail.trim());
                        sendInvitation();
                      }} 
                      disabled={!inviteEmail.trim()}
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.first_name && member.last_name 
                              ? `${member.first_name} ${member.last_name}`
                              : 'Not provided'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {formatRole(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {member.last_login 
                          ? new Date(member.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {member.id !== user?.id && (
                            <>
                              <Select
                                value={member.role}
                                onValueChange={(value: UserRole) => updateUserRole(member.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="case_handler">Case Handler</SelectItem>
                                  <SelectItem value="reviewer">Reviewer</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="org_admin">Org Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deactivateUser(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
                          ? `${invitation.invited_by_profile.first_name} ${invitation.invited_by_profile.last_name}`
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
