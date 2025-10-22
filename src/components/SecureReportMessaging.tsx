import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BrandedFormLayout from '@/components/BrandedFormLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Send } from 'lucide-react';
import { auditLogger } from '@/utils/auditLogger';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  priority: number;
  report_type: string;
  organization_id: string;
  organizations?: {
    name: string;
    logo_url?: string;
    custom_logo_url?: string;
    brand_color?: string;
  };
}

interface Message {
  id: string;
  sender_type: string;
  encrypted_message: string;
  created_at: string;
  is_read: boolean;
}

interface OrganizationData {
  id?: string;
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color?: string;
}

const SecureReportMessaging = () => {
  const { trackingId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (trackingId) {
      fetchReportAndMessages();
      // Also fetch organization branding independently in case report lookup fails
      fetchOrganizationBranding();
    }
    
    // Get organization data from navigation state if available
    if (location.state?.organizationData) {
      setOrganizationData(location.state.organizationData);
    }
  }, [trackingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time messaging
  useEffect(() => {
    if (report?.id) {
      const channelName = `report-messages-${report.id}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'report_messages',
            filter: `report_id=eq.${report.id}`,
          },
          (payload) => {
            console.log('Real-time message received:', payload.new);
            const newMessage = payload.new as Message;
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              const updated = [...prev, newMessage];
              console.log('Messages updated, count:', updated.length);
              return updated;
            });
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });

      return () => {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [report?.id]);

  const fetchReportAndMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching report for tracking ID:', trackingId);

      // Fetch report
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select(`
          *,
          organizations!inner(
            name,
            logo_url,
            custom_logo_url,
            brand_color
          )
        `)
        .eq('tracking_id', trackingId)
        .single();

      if (reportError || !reportData) {
        console.error('Report not found:', reportError);
        toast({
          title: "Report Not Found",
          description: "The tracking ID you provided could not be found.",
          variant: "destructive",
        });
        return;
      }

      // Check if report is archived - don't show to whistleblowers
      if (reportData.status === 'archived') {
        console.log('Report is archived, not showing to whistleblower');
        toast({
          title: "Case Not Found",
          description: "Your case was either resolved or removed. Please submit a new case or check your case ID.",
          variant: "destructive",
        });
        return;
      }

      console.log('Report found:', reportData);
      setReport(reportData);
      
      // Set organization data if not already set
      if (!organizationData && reportData.organizations) {
        setOrganizationData({
          name: reportData.organizations.name,
          logo_url: reportData.organizations.logo_url,
          custom_logo_url: reportData.organizations.custom_logo_url,
          brand_color: reportData.organizations.brand_color,
        });
      }

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('report_messages')
        .select('*')
        .eq('report_id', reportData.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Messages fetch error:', messagesError);
      } else {
        console.log('Messages fetched:', messagesData?.length || 0);
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error('Error fetching report and messages:', error);
      toast({
        title: "Error",
        description: "Failed to load report information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationBranding = async () => {
    if (!trackingId) return;
    
    try {
      console.log('Fetching organization branding for tracking ID:', trackingId);
      
      // Use the RPC function to get organization data by tracking ID
      const { data: orgData, error: orgError } = await supabase
        .rpc('get_organization_by_tracking_id', { p_tracking_id: trackingId });

      if (orgError || !orgData || orgData.length === 0) {
        console.error('Organization branding lookup error:', orgError);
        return;
      }

      const org = orgData[0];
      console.log('Found organization branding:', org);
      
      setOrganizationData({
        id: org.organization_id,
        name: org.organization_name,
        logo_url: org.logo_url,
        custom_logo_url: org.custom_logo_url,
        brand_color: org.brand_color
      });
    } catch (error) {
      console.error('Error fetching organization branding:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !report) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - add message immediately to UI
    const optimisticMessage = {
      id: tempId,
      sender_type: 'whistleblower' as const,
      encrypted_message: messageText,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const { data, error } = await supabase
        .from('report_messages')
        .insert({
          report_id: report.id,
          sender_type: 'whistleblower',
          encrypted_message: messageText,
        })
        .select()
        .single();

      if (error) {
        console.error('Message send error:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        setNewMessage(messageText); // Restore the message
        throw error;
      }

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => (msg.id === tempId ? data : msg))
      );

      // Log message to audit trail
      await auditLogger.log({
        eventType: 'report.message_sent',
        category: 'case_management',
        action: 'Whistleblower sent secure message',
        severity: 'low',
        actorType: 'user',
        actorEmail: 'anonymous_whistleblower',
        targetType: 'report',
        targetId: report.id,
        targetName: report.tracking_id,
        summary: `Whistleblower sent message on report ${report.tracking_id}`,
        description: `Message sent via secure report messaging interface`,
        metadata: {
          message_length: messageText.length,
          sender_type: 'whistleblower',
          report_status: report.status,
          report_type: report.report_type,
        },
        organizationId: report.organization_id,
      });

      toast({
        title: "Message Sent",
        description: "Your message has been sent securely.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <BrandedFormLayout
        title="Loading..."
        description="Loading your report..."
        organizationName={organizationData?.name || "Loading"}
        logoUrl={organizationData?.custom_logo_url || organizationData?.logo_url}
        brandColor={organizationData?.brand_color}
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your report...</p>
        </div>
      </BrandedFormLayout>
    );
  }

  if (!report) {
    return (
      <BrandedFormLayout
        title="Report Not Found"
        description="Unable to load report"
        organizationName={organizationData?.name || "Error"}
        logoUrl={organizationData?.custom_logo_url || organizationData?.logo_url}
        brandColor={organizationData?.brand_color}
      >
        <div className="text-center py-8">
          <p className="text-red-600">Report not found. Please check your tracking ID.</p>
        </div>
      </BrandedFormLayout>
    );
  }

  return (
    <BrandedFormLayout
      title="Secure Communication"
      description="Communicate securely about your report"
      organizationName={organizationData?.name || report.organizations?.name}
      logoUrl={organizationData?.custom_logo_url || organizationData?.logo_url || report.organizations?.custom_logo_url}
      brandColor={organizationData?.brand_color || report.organizations?.brand_color}
    >
      <div className="space-y-6">
        {/* Report Summary */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>
                  Report ID: {report.tracking_id} • Submitted on{' '}
                  {new Date(report.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(report.status)}>
                {formatStatus(report.status)}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Secure Messages</span>
            </CardTitle>
            <CardDescription>
              All communication is encrypted end-to-end for your security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Your case handler will respond soon.</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.sender_type === 'whistleblower'
                          ? 'bg-blue-50 ml-8 border-l-4 border-blue-500'
                          : 'bg-gray-50 mr-8 border-l-4 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {message.sender_type === 'whistleblower' ? 'You' : 'Case Handler'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{message.decrypted_message || message.encrypted_message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <Label htmlFor="newMessage">Send a secure message</Label>
                <Textarea
                  id="newMessage"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message to the case handler... (Press Enter to send, Shift+Enter for new line)"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        handleSendMessage(e);
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Messages are encrypted end-to-end
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={sending || !newMessage.trim()}
                className="w-full"
                style={{ 
                  backgroundColor: organizationData?.brand_color || report.organizations?.brand_color || '#2563eb' 
                }}
              >
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

export default SecureReportMessaging;