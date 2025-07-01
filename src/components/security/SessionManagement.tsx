
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Clock, LogOut, Shield } from 'lucide-react';

const SessionManagement = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [activeSessions, setActiveSessions] = useState(1);

  useEffect(() => {
    // Update last activity on user interaction
    const updateActivity = () => setLastActivity(new Date());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  useEffect(() => {
    // Set up session timeout
    const timeout = parseInt(sessionTimeout) * 60 * 60 * 1000; // Convert hours to milliseconds
    
    const checkSession = () => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      
      if (timeSinceActivity > timeout) {
        handleSessionTimeout();
      }
    };

    const interval = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [sessionTimeout, lastActivity]);

  const handleSessionTimeout = async () => {
    toast({
      title: "Session Expired",
      description: "Your session has expired due to inactivity. Please log in again.",
      variant: "destructive",
    });
    
    await signOut();
  };

  const handleTimeoutChange = (value: string) => {
    setSessionTimeout(value);
    toast({
      title: "Session Timeout Updated",
      description: `Session will expire after ${value} hours of inactivity`,
    });
  };

  const terminateAllSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast({
        title: "All Sessions Terminated",
        description: "You have been logged out from all devices",
      });
    } catch (error: any) {
      console.error('Error terminating sessions:', error);
      toast({
        title: "Error",
        description: "Failed to terminate all sessions",
        variant: "destructive",
      });
    }
  };

  const formatLastActivity = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastActivity.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Management
        </CardTitle>
        <CardDescription>
          Control your session timeout and active sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Session Timeout</h4>
            <Select value={sessionTimeout} onValueChange={handleTimeoutChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Automatically sign out after this period of inactivity
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Last Activity</h4>
              <p className="text-sm text-gray-600">{formatLastActivity()}</p>
            </div>
            <Badge variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Active Sessions</h4>
              <p className="text-sm text-gray-600">Sessions across all devices</p>
            </div>
            <Badge variant="secondary">{activeSessions}</Badge>
          </div>

          <Button 
            onClick={terminateAllSessions}
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out All Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManagement;
