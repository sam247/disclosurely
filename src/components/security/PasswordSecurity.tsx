
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Key, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { log, LogContext } from '@/utils/logger';
import * as Sentry from '@sentry/react';

interface PasswordStrength {
  score: number;
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

const PasswordSecurity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const analyzePassword = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const score = Math.min((metRequirements / 5) * 100, 100);

    const feedback = [];
    if (!requirements.length) feedback.push('Use at least 12 characters');
    if (!requirements.uppercase) feedback.push('Include uppercase letters');
    if (!requirements.lowercase) feedback.push('Include lowercase letters');
    if (!requirements.numbers) feedback.push('Include numbers');
    if (!requirements.symbols) feedback.push('Include special characters');

    return { score, feedback, requirements };
  };

  const getStrengthLabel = (score: number): { label: string; color: string } => {
    if (score < 40) return { label: 'Weak', color: 'text-red-600' };
    if (score < 70) return { label: 'Fair', color: 'text-orange-600' };
    if (score < 90) return { label: 'Good', color: 'text-blue-600' };
    return { label: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = analyzePassword(newPassword);
  const strengthInfo = getStrengthLabel(passwordStrength.score);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength.score < 70) {
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setIsChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed",
      });
    } catch (error: any) {
      // Critical security operation - log to Sentry
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { component: 'PasswordSecurity', action: 'changePassword' },
          extra: { userId: user?.id }
        });
        log.error(LogContext.SECURITY, 'Error changing password', error, { userId: user?.id });
      }
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Password Security
        </CardTitle>
        <CardDescription>
          Update your password and view security requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            {newPassword && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password Strength</span>
                  <span className={`text-sm font-medium ${strengthInfo.color}`}>
                    {strengthInfo.label}
                  </span>
                </div>
                <Progress value={passwordStrength.score} className="h-2" />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <Button 
            onClick={handlePasswordChange}
            disabled={isChanging || passwordStrength.score < 70}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            {isChanging ? 'Updating...' : 'Update Password'}
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Password Requirements
          </h4>
          <div className="space-y-2">
            {Object.entries(passwordStrength.requirements).map(([key, met]) => {
              const labels = {
                length: 'At least 12 characters',
                uppercase: 'Uppercase letters (A-Z)',
                lowercase: 'Lowercase letters (a-z)',
                numbers: 'Numbers (0-9)',
                symbols: 'Special characters (!@#$%^&*)'
              };

              return (
                <div key={key} className="flex items-center gap-2">
                  {met ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${met ? 'text-green-600' : 'text-gray-600'}`}>
                    {labels[key as keyof typeof labels]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordSecurity;
