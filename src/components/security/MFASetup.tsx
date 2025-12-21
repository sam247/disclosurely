
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Smartphone, Key, Check, X } from 'lucide-react';
import { log, LogContext } from '@/utils/logger';
import * as Sentry from '@sentry/react';

const MFASetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [factorId, setFactorId] = useState('');

  useEffect(() => {
    checkMFAStatus();
  }, [user]);

  const checkMFAStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const hasActiveFactor = data?.totp?.some(factor => factor.status === 'verified');
      setMfaEnabled(!!hasActiveFactor);
    } catch (error) {
      log.error(LogContext.SECURITY, 'Error checking MFA status', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const startMFAEnrollment = async () => {
    if (!user) return;

    setIsEnabling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      // Access the QR code and secret from the totp property
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      
      toast({
        title: "MFA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error: any) {
      // Critical security operation - log to Sentry
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { component: 'MFASetup', action: 'startEnrollment' },
          extra: { userId: user?.id }
        });
        log.error(LogContext.SECURITY, 'Error starting MFA enrollment', error, { userId: user?.id });
      }
      toast({
        title: "Setup Error",
        description: error.message || "Failed to start MFA setup",
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!user || !verificationCode || !factorId) return;

    setIsVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (verifyError) throw verifyError;

      setMfaEnabled(true);
      setQrCode('');
      setSecret('');
      setVerificationCode('');
      setFactorId('');
      
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
    } catch (error: any) {
      // Critical security operation - log to Sentry
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { component: 'MFASetup', action: 'verifyMFA' },
          extra: { userId: user?.id }
        });
        log.error(LogContext.SECURITY, 'Error verifying MFA', error, { userId: user?.id });
      }
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const disableMFA = async () => {
    if (!user) return;

    try {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const factor = data?.totp?.[0];
      if (!factor) return;

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factor.id
      });

      if (error) throw error;

      setMfaEnabled(false);
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    } catch (error: any) {
      // Critical security operation - log to Sentry
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { component: 'MFASetup', action: 'disableMFA' },
          extra: { userId: user?.id }
        });
        log.error(LogContext.SECURITY, 'Error disabling MFA', error, { userId: user?.id });
      }
      toast({
        title: "Error",
        description: error.message || "Failed to disable MFA",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">MFA Status</h4>
            <p className="text-sm text-gray-600">
              {mfaEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
            </p>
          </div>
          <Badge variant={mfaEnabled ? "default" : "secondary"} className="flex items-center gap-1">
            {mfaEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {mfaEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        {!mfaEnabled && !qrCode && (
          <Button onClick={startMFAEnrollment} disabled={isEnabling} className="w-full">
            <Smartphone className="h-4 w-4 mr-2" />
            {isEnabling ? 'Setting up...' : 'Enable MFA'}
          </Button>
        )}

        {qrCode && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">Scan QR Code</h4>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Scan this code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">Manual Entry Code</Label>
              <Input
                id="secret"
                value={secret}
                readOnly
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use this code if you can't scan the QR code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification">Verification Code</Label>
              <Input
                id="verification"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button 
              onClick={verifyAndEnableMFA} 
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {isVerifying ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
        )}

        {mfaEnabled && (
          <Button onClick={disableMFA} variant="outline" className="w-full">
            Disable MFA
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASetup;
