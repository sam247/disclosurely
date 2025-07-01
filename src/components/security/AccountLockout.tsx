
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserX, Shield, AlertTriangle, Clock } from 'lucide-react';

const AccountLockout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutThreshold, setLockoutThreshold] = useState('5');
  const [lockoutDuration, setLockoutDuration] = useState('30');
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndsAt, setLockoutEndsAt] = useState<Date | null>(null);

  useEffect(() => {
    checkLockoutStatus();
  }, [user]);

  const checkLockoutStatus = async () => {
    // In a real implementation, this would check the database for lockout status
    // For demo purposes, we'll simulate this
    const lastFailedAttempt = localStorage.getItem('lastFailedAttempt');
    const attempts = parseInt(localStorage.getItem('failedAttempts') || '0');
    
    setFailedAttempts(attempts);
    
    if (attempts >= parseInt(lockoutThreshold)) {
      const lockoutEnd = new Date(Date.now() + parseInt(lockoutDuration) * 60 * 1000);
      setLockoutEndsAt(lockoutEnd);
      setIsLocked(true);
    }
  };

  const simulateFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    localStorage.setItem('failedAttempts', newAttempts.toString());
    localStorage.setItem('lastFailedAttempt', new Date().toISOString());

    if (newAttempts >= parseInt(lockoutThreshold)) {
      const lockoutEnd = new Date(Date.now() + parseInt(lockoutDuration) * 60 * 1000);
      setLockoutEndsAt(lockoutEnd);
      setIsLocked(true);
      
      toast({
        title: "Account Locked",
        description: `Account locked due to ${newAttempts} failed login attempts`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Failed Attempt Recorded",
        description: `${newAttempts} of ${lockoutThreshold} attempts used`,
        variant: "destructive",
      });
    }
  };

  const resetAttempts = () => {
    setFailedAttempts(0);
    setIsLocked(false);
    setLockoutEndsAt(null);
    localStorage.removeItem('failedAttempts');
    localStorage.removeItem('lastFailedAttempt');
    
    toast({
      title: "Attempts Reset",
      description: "Failed login attempts have been reset",
    });
  };

  const updateLockoutSettings = () => {
    toast({
      title: "Settings Updated",
      description: `Account will lock after ${lockoutThreshold} failed attempts for ${lockoutDuration} minutes`,
    });
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutEndsAt) return '';
    
    const now = new Date();
    const remaining = Math.max(0, lockoutEndsAt.getTime() - now.getTime());
    const minutes = Math.ceil(remaining / (1000 * 60));
    
    return `${minutes} minutes`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserX className="h-5 w-5" />
          Account Lockout Protection
        </CardTitle>
        <CardDescription>
          Protect your account from brute force attacks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLocked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Account is currently locked. Lockout expires in {getRemainingLockoutTime()}.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Lockout Threshold</h4>
            <Select value={lockoutThreshold} onValueChange={setLockoutThreshold}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 attempts</SelectItem>
                <SelectItem value="5">5 attempts</SelectItem>
                <SelectItem value="10">10 attempts</SelectItem>
                <SelectItem value="15">15 attempts</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Lock account after this many failed attempts
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Lockout Duration</h4>
            <Select value={lockoutDuration} onValueChange={setLockoutDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              How long to lock the account
            </p>
          </div>
        </div>

        <Button onClick={updateLockoutSettings} className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          Update Lockout Settings
        </Button>

        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium">Current Status</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Failed Attempts</span>
            <Badge variant={failedAttempts > 0 ? "destructive" : "secondary"}>
              {failedAttempts} / {lockoutThreshold}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Account Status</span>
            <Badge variant={isLocked ? "destructive" : "default"}>
              {isLocked ? (
                <>
                  <UserX className="h-3 w-3 mr-1" />
                  Locked
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Active
                </>
              )}
            </Badge>
          </div>

          {lockoutEndsAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Lockout Expires</span>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getRemainingLockoutTime()}
              </span>
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <h4 className="font-medium text-sm">Testing (Demo Only)</h4>
          <div className="flex gap-2">
            <Button 
              onClick={simulateFailedAttempt}
              variant="outline"
              size="sm"
              disabled={isLocked}
            >
              Simulate Failed Login
            </Button>
            <Button 
              onClick={resetAttempts}
              variant="outline"
              size="sm"
            >
              Reset Attempts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountLockout;
