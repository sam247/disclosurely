
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Lock, AlertTriangle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AccountLockout = () => {
  const { user } = useAuth();
  const [lockoutInfo, setLockoutInfo] = useState<{
    isLocked: boolean;
    failedAttempts: number;
    maxAttempts: number;
    lockoutDuration: number;
  }>({
    isLocked: false,
    failedAttempts: 0,
    maxAttempts: 5,
    lockoutDuration: 15
  });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchLockoutStatus();
      fetchRecentAttempts();
    }
  }, [user]);

  const fetchLockoutStatus = async () => {
    if (!user?.email) return;

    try {
      // Check if account is currently locked
      const { data: isLocked, error: lockError } = await supabase.rpc('is_account_locked', {
        p_email: user.email,
        p_organization_id: null
      });

      // Get lockout settings
      const { data: settings } = await supabase
        .from('lockout_settings')
        .select('max_attempts, lockout_duration_minutes')
        .limit(1)
        .maybeSingle();

      // Count recent failed attempts
      const { count } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('email', user.email)
        .eq('success', false)
        .gte('attempted_at', new Date(Date.now() - (settings?.lockout_duration_minutes || 15) * 60 * 1000).toISOString());

      setLockoutInfo({
        isLocked: isLocked || false,
        failedAttempts: count || 0,
        maxAttempts: settings?.max_attempts || 5,
        lockoutDuration: settings?.lockout_duration_minutes || 15
      });
    } catch (error) {
      console.error('Error fetching lockout status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAttempts = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', user.email)
        .order('attempted_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentAttempts(data);
      }
    } catch (error) {
      console.error('Error fetching login attempts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Account Lockout Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading lockout status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Account Lockout Protection
        </CardTitle>
        <CardDescription>
          Server-side protection against brute-force attacks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Account Status</h4>
              <p className="text-sm text-gray-600">
                {lockoutInfo.isLocked ? 'Account is temporarily locked' : 'Account is active'}
              </p>
            </div>
            <Badge variant={lockoutInfo.isLocked ? "destructive" : "default"} className="flex items-center gap-1">
              {lockoutInfo.isLocked ? <AlertTriangle className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
              {lockoutInfo.isLocked ? 'Locked' : 'Active'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-gray-600">Failed Attempts</p>
              <p className="text-2xl font-bold text-red-600">
                {lockoutInfo.failedAttempts} / {lockoutInfo.maxAttempts}
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-gray-600">Lockout Duration</p>
              <p className="text-2xl font-bold text-orange-600">{lockoutInfo.lockoutDuration} min</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Server-Side Protection:</strong> After {lockoutInfo.maxAttempts} failed login attempts, accounts are temporarily locked for {lockoutInfo.lockoutDuration} minutes. All attempts are tracked server-side and cannot be bypassed.
          </div>

          {recentAttempts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Login Attempts
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="text-sm">{formatDate(attempt.attempted_at)}</TableCell>
                        <TableCell>
                          <Badge variant={attempt.success ? "default" : "destructive"}>
                            {attempt.success ? 'Success' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {attempt.ip_address || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountLockout;
