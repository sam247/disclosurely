import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Shield, Activity, Search, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEvent {
  id: string;
  event_type: string;
  actor_id?: string;
  actor_email?: string;
  actor_ip_address?: unknown;
  actor_user_agent?: string;
  target_type?: string;
  target_id?: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: any;
  created_at: string;
  summary: string;
}

const AuditTrail = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    fetchAuditEvents();
  }, [eventTypeFilter, riskLevelFilter, dateRange]);

  const fetchAuditEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Use filtered view for non-admin users to hide sensitive data for anonymous cases (PRIVACY FIX H3)
      const { isAdmin } = useUserRoles();
      const isOwner = isAdmin;
      
      let query = supabase
        .from(isOwner ? 'audit_logs' as any : 'audit_logs_filtered')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply date filter
      if (dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      // Apply event type filter
      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      // Apply severity level filter
      if (riskLevelFilter !== 'all') {
        query = query.eq('severity', riskLevelFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit events:', error);
        // If table doesn't exist yet, show empty state
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          setAuditEvents([]);
          return;
        }
        throw error;
      }
      
      // Convert the database results to our interface format
      const typedData: AuditEvent[] = ((data as any) || []).map((item: any) => ({
        id: item.id,
        event_type: item.event_type,
        actor_id: item.actor_id || undefined,
        actor_email: item.actor_email || undefined,
        actor_ip_address: item.actor_ip_address,
        actor_user_agent: item.actor_user_agent || undefined,
        target_type: item.target_type || undefined,
        target_id: item.target_id || undefined,
        action: item.action,
        severity: item.severity as 'low' | 'medium' | 'high' | 'critical',
        metadata: item.metadata,
        created_at: item.created_at,
        summary: item.summary,
      }));
      
      setAuditEvents(typedData);
    } catch (error: any) {
      console.error('Error fetching audit events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLog = async () => {
    try {
      // Create CSV content
      const headers = ['Timestamp', 'Event Type', 'User', 'Action', 'Summary', 'Severity', 'IP Address', 'Details'];
      const csvContent = [
        headers.join(','),
        ...auditEvents.map(event => [
          format(new Date(event.created_at), 'yyyy-MM-dd HH:mm:ss'),
          event.event_type,
          event.actor_email || 'System',
          event.action,
          event.summary,
          event.severity,
          event.actor_ip_address ? String(event.actor_ip_address) : 'N/A',
          JSON.stringify(event.metadata || {}).replace(/,/g, ';')
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Audit log has been exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export audit log",
        variant: "destructive",
      });
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredEvents = auditEvents.filter(event =>
    searchTerm === '' || 
    event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.actor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Trail
        </CardTitle>
        <CardDescription>
          Monitor all security events and user activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>
          
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="authentication">Authentication</SelectItem>
              <SelectItem value="authorization">Authorization</SelectItem>
              <SelectItem value="data_access">Data Access</SelectItem>
              <SelectItem value="configuration">Configuration</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>

          <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Day</SelectItem>
              <SelectItem value="7">Last Week</SelectItem>
              <SelectItem value="30">Last Month</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportAuditLog} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Events List */}
        <ScrollArea className="h-[500px] w-full">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit events found</p>
              <p className="text-sm">Security events will appear here once they start being logged</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event) => (
                 <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityIcon(event.severity)}
                        <span className="font-medium text-sm">{event.summary}</span>
                        <Badge className={`text-xs ${getRiskBadgeColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {event.event_type}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Action: {event.action}</div>
                        <div>User: {event.actor_email || 'System'}</div>
                        {event.actor_ip_address && <div>IP: {String(event.actor_ip_address)}</div>}
                        {event.target_type && (
                          <div>Target: {event.target_type} {event.target_id && `(${event.target_id})`}</div>
                        )}
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View Details
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 ml-4">
                      {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AuditTrail;
