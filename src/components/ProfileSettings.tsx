
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Lock, Mail } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(prev => ({
          ...prev,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        }));
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email, // Include required email field
          first_name: profile.first_name,
          last_name: profile.last_name,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || profile.email === user.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: profile.email,
      });

      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check both your old and new email addresses for confirmation links.",
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                value={profile.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={profile.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
            />
            {profile.email !== user?.email && (
              <p className="text-sm text-orange-600 mt-2">
                Email change requires confirmation from both old and new addresses
              </p>
            )}
          </div>
          <Button 
            onClick={handleUpdateEmail} 
            disabled={loading || profile.email === user?.email}
            variant="outline"
          >
            {loading ? 'Updating...' : 'Update Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <p className="text-sm text-gray-600 mb-2">
                To change your password, you'll need to use the password reset feature
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  supabase.auth.resetPasswordForEmail(user?.email || '', {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                  });
                  toast({
                    title: "Password reset sent",
                    description: "Check your email for password reset instructions.",
                  });
                }}
              >
                Send Password Reset Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
