
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { log, LogContext } from '@/utils/logger';
import * as Sentry from '@sentry/react';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!organizationName.trim()) {
      toast({
        title: "Error",
        description: "Please provide your organization name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `https://app.disclosurely.com/dashboard`;
      
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        toast({
          title: "Signup Failed",
          description: authError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Step 2: Create organization
      // Auto-generate domain from organization name (lowercase, remove spaces)
      const domainSlug = organizationName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ''); // Remove all spaces

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName.trim(),
          domain: domainSlug,
          description: `${organizationName} organization`,
        })
        .select()
        .single();

      if (orgError) {
        // Critical auth operation - log to Sentry
        if (orgError instanceof Error) {
          Sentry.captureException(orgError, {
            tags: { component: 'SignupForm', action: 'createOrganization' },
            extra: { email }
          });
        }
        log.error(LogContext.AUTH, 'Organization creation error during signup', orgError instanceof Error ? orgError : new Error(String(orgError)), { email });
        toast({
          title: "Error",
          description: `Failed to create organization: ${orgError.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Step 3: Create profile with organization_id
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          organization_id: orgData.id,
          role: 'org_admin',
          is_active: true,
        });

      if (profileError) {
        // Critical auth operation - log to Sentry
        if (profileError instanceof Error) {
          Sentry.captureException(profileError, {
            tags: { component: 'SignupForm', action: 'createProfile' },
            extra: { email }
          });
        }
        log.error(LogContext.AUTH, 'Profile creation error during signup', profileError instanceof Error ? profileError : new Error(String(profileError)), { email });
        toast({
          title: "Error",
          description: `Account created but failed to set up organization: ${profileError.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account.",
      });
      window.location.href = 'https://app.disclosurely.com/auth/login';
    } catch (error: any) {
      // Critical auth operation - log to Sentry
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { component: 'SignupForm', action: 'signup' },
          extra: { email }
        });
      }
      log.error(LogContext.AUTH, 'Signup error', error instanceof Error ? error : new Error(String(error)), { email });
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://app.disclosurely.com/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Google Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred with Google signup",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGoogleSignup}
        variant="outline"
        className="w-full h-9 text-sm"
        loading={googleLoading}
        loadingText="Signing up with Google..."
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" className="text-sm">First name</Label>
            <div className="mt-1">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm">Last name</Label>
            <div className="mt-1">
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm">Email address</Label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-sm">Confirm password</Label>
            <div className="mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div>
            <Label htmlFor="organizationName" className="text-sm">Business Name</Label>
            <div className="mt-1">
              <Input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your business name"
                className="h-9 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Your submission link will be automatically generated from your business name
              </p>
            </div>
          </div>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            className="w-full h-9 text-sm"
            loading={loading}
            loadingText="Creating account..."
          >
            Create account
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{' '}
            <a href="https://app.disclosurely.com/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
