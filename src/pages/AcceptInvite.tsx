import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  // Check if user is already logged in and redirect to dashboard if so
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast({
          title: "Already Logged In",
          description: "You're already logged in. Please log out first to accept a new invitation.",
        });
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate, toast]);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          *,
          organization:organizations (
            name,
            brand_color
          )
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/signup');
        return;
      }

      setInvitation(data);
    } catch (error) {
      console.error('Error validating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to validate invitation",
        variant: "destructive",
      });
      navigate('/signup');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!invitation || !token) return;

    setSubmitting(true);

    try {
      // Sign up the user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          emailRedirectTo: 'https://app.disclosurely.com/dashboard',
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signupError) {
        toast({
          title: "Signup Failed",
          description: signupError.message,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Accept the invitation via edge function
      const { error: acceptError } = await supabase.functions.invoke('accept-team-invitation', {
        body: {
          token,
          userId: authData.user.id,
        },
      });

      if (acceptError) {
        console.error('Error accepting invitation:', acceptError);
        toast({
          title: "Warning",
          description: "Account created but failed to link to organization. Please contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Welcome to ${invitation.organization.name}! Please check your email to verify your account.`,
        });
      }

      // Redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invitation.organization.name}</strong> as a{' '}
            <strong>{invitation.role.replace('_', ' ')}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {invitation.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Accept & Create Account'
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
