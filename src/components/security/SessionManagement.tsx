
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Clock, LogOut, Shield, Timer } from 'lucide-react';

const SessionManagement = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { getIdleTimeRemaining, getAbsoluteTimeRemaining } = useSessionTimeout();
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [activeSessions, setActiveSessions] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState({ idle: 0, absolute: 0 });

  useEffect(() => {
    // Update last activity on user interaction
    const updateActivity = () => setLastActivity(new Date());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Update remaining time display every minute
    const interval = setInterval(() => {
      setTimeRemaining({
        idle: getIdleTimeRemaining(),
        absolute: getAbsoluteTimeRemaining()
      });
    }, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(interval);
    };
  }, [getIdleTimeRemaining, getAbsoluteTimeRemaining]);

  // Initialize time remaining display
  useEffect(() => {
    setTimeRemaining({
      idle: getIdleTimeRemaining(),
      absolute: getAbsoluteTimeRemaining()
    });
  }, [getIdleTimeRemaining, getAbsoluteTimeRemaining]);

  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) return 'Expired';
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4" />
                <h4 className="font-medium">Idle Timeout</h4>
              </div>
              <p className="text-2xl font-bold text-orange-600">7 minutes</p>
              <p className="text-sm text-gray-600">Auto logout when inactive</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" />
                <h4 className="font-medium">Session Limit</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">4 hours</p>
              <p className="text-sm text-gray-600">Maximum session duration</p>
            </div>
          </div>

          <div className="space-y-2">
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
            
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Security:</strong> Sessions automatically expire after 7 minutes of inactivity or 4 hours maximum duration for enhanced security.
            </div>
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
