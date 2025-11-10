
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';

const LoginForm = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const langPrefix = currentLanguage && currentLanguage !== 'en' ? `/${currentLanguage}` : '';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if account is locked before attempting login (optional - gracefully handle if RPC doesn't exist)
      try {
        const { data: lockoutData, error: lockoutError } = await supabase.rpc('is_account_locked', {
          p_email: email,
          p_organization_id: null
        });

        if (!lockoutError && lockoutData === true) {
          toast({
            title: "Account Temporarily Locked",
            description: "Too many failed login attempts. Please try again later.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } catch (rpcError) {
        // RPC function might not exist or be unavailable - continue with login
        console.warn('Account lockout check failed, continuing with login:', rpcError);
      }

      // Use standard OTP authentication flow
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new users on login
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Login Failed", 
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check Your Email",
          description: "We've sent you a 6-digit verification code. Please check your email and enter the code.",
        });
        setShowOTP(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    toast({
      title: "Welcome!",
      description: "You have been successfully signed in.",
    });
    navigate('/dashboard');
  };

  const handleBackToLogin = () => {
    setShowOTP(false);
    setEmail('');
  };


  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred with Google login",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };


  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        onSuccess={handleOTPSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        className="w-full"
        loading={googleLoading}
        loadingText={t('auth.signin.signingInWithGoogle')}
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
        {t('auth.signin.continueWithGoogle')}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">{t('auth.signin.orContinueWith')}</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email">{t('auth.signin.emailLabel')}</Label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.signin.emailPlaceholder')}
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            loadingText={t('auth.signin.sendingCode')}
          >
            {t('auth.signin.signInButton')}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('auth.signin.noAccount')}{' '}
            <Link to={`${langPrefix}/auth/signup`} className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.signin.signUpLink')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
