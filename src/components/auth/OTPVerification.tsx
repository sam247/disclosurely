
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPVerification = ({ email, onSuccess, onBack }: OTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Successfully logged in!",
        });
        onSuccess();
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

  const handleResendOTP = async () => {
    setResending(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) {
        toast({
          title: "Failed to Resend",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>

        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResendOTP}
            disabled={resending}
            className="w-full"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </form>

      <div className="text-center text-sm text-gray-500">
        <p>Check your spam folder if you don't see the email</p>
        <p>The code expires in 10 minutes</p>
      </div>
    </div>
  );
};

export default OTPVerification;
