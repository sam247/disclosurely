import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BrandedFormLayout from '@/components/BrandedFormLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auditLogger } from '@/utils/auditLogger';

interface OrgBranding { name?: string; brand_color?: string; logo_url?: string; custom_logo_url?: string; }
interface ReportInfo { id: string; tracking_id: string; title: string; status: string; created_at: string; organization_id: string; }
interface Message { id: string; sender_type: string; encrypted_message: string; created_at: string; is_read: boolean; }

const AnonymousMessaging = () => {
  const { trackingId } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  const [branding, setBranding] = useState<OrgBranding | null>(location.state?.organizationData || null);
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const brandColor = useMemo(() => branding?.brand_color, [branding]);

  useEffect(() => {
    const load = async () => {
      if (!trackingId) return;
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: { action: 'load', trackingId }
      });
      if (error || data?.error) {
        toast({ title: 'Report Not Found', description: 'Please check your tracking ID.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setReport(data.report);
      setMessages(data.messages || []);
      // Prefer server branding when available
      if (data.organization) setBranding(data.organization);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !trackingId) return;
    setSending(true);
    const optimistic = {
      id: `temp-${Date.now()}`,
      sender_type: 'whistleblower',
      encrypted_message: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    } as Message;
    setMessages(prev => [...prev, optimistic]);
    const messageText = newMessage.trim();
    setNewMessage('');

    const { data, error } = await supabase.functions.invoke('anonymous-report-messaging', {
      body: { action: 'send', trackingId, message: messageText }
    });

    if (error || data?.error) {
      // rollback
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setNewMessage(messageText);
      toast({ title: 'Send failed', description: 'Please try again.', variant: 'destructive' });
    } else {
      // replace optimistic with real
      setMessages(prev => prev.map(m => (m.id === optimistic.id ? data.message : m)));
      
      // Log successful message to audit trail
      if (report?.organization_id) {
        await auditLogger.log({
          eventType: 'report.anonymous_message_sent',
          category: 'case_management',
          action: 'Anonymous whistleblower sent message',
          severity: 'low',
          actorType: 'user',
          actorEmail: 'anonymous_user',
          targetType: 'report',
          targetId: report.id,
          targetName: report.tracking_id,
          summary: `Anonymous message sent on report ${report.tracking_id}`,
          description: 'Message sent via anonymous messaging interface',
          metadata: {
            message_length: messageText.length,
            sender_type: 'whistleblower',
            report_status: report.status,
          },
          organizationId: report.organization_id,
        });
      }
    }
    setSending(false);
  };

  if (loading) {
    return (
      <BrandedFormLayout title="Loading..." description="Loading your report..." organizationName={branding?.name || 'Loading'} logoUrl={branding?.custom_logo_url || branding?.logo_url} brandColor={brandColor}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your report...</p>
        </div>
      </BrandedFormLayout>
    );
  }

  if (!report) {
    return (
      <BrandedFormLayout title="Error" description="Secure Report Submission" organizationName={branding?.name || 'Error'}>
        <div className="text-center py-8">
          <p className="text-red-600">Report not found. Please check your tracking ID.</p>
        </div>
      </BrandedFormLayout>
    );
  }

  const statusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'new': return `${base} bg-blue-100 text-blue-800`;
      case 'in_review': return `${base} bg-yellow-100 text-yellow-800`;
      case 'investigating': return `${base} bg-orange-100 text-orange-800`;
      case 'resolved': return `${base} bg-green-100 text-green-800`;
      case 'closed': return `${base} bg-gray-100 text-gray-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <BrandedFormLayout title="Secure Communication" description="Communicate securely about your report" organizationName={branding?.name} logoUrl={branding?.custom_logo_url || branding?.logo_url} brandColor={brandColor}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>
                  Report ID: {report.tracking_id} • Submitted on {new Date(report.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className={statusBadge(report.status)}> {report.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Secure Messages</span>
            </CardTitle>
            <CardDescription>All communication is encrypted end-to-end for your security.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Your case handler will respond soon.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`p-4 rounded-lg ${m.sender_type === 'whistleblower' ? 'bg-blue-50 ml-8 border-l-4 border-blue-500' : 'bg-gray-50 mr-8 border-l-4 border-gray-300'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">{m.sender_type === 'whistleblower' ? 'You' : 'Case Handler'}</span>
                      <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-900">{m.encrypted_message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="space-y-4">
              <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." rows={3} />
              <Button type="submit" disabled={sending || !newMessage.trim()} className="w-full" style={{ backgroundColor: brandColor || '#2563eb' }}>
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </BrandedFormLayout>
  );
};

export default AnonymousMessaging;
