
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Lock, Search } from 'lucide-react';
import { log } from '@/utils/logger';

interface Message {
  id: string;
  sender_type: string;
  encrypted_message: string;
  created_at: string;
  is_read: boolean;
  sender_id: string | null;
}

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  organization_id: string;
}

const WhistleblowerMessaging = () => {
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (report) {
      fetchMessages();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`whistleblower-messages-${report.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'report_messages',
            filter: `report_id=eq.${report.id}`,
          },
          (payload) => {
            console.log('New message received on whistleblower side:', payload.new);
            const newMsg = payload.new as Message;
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              if (prev.some(msg => msg.id === newMsg.id)) {
                return prev;
              }
              return [...prev, newMsg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'report_messages',
            filter: `report_id=eq.${report.id}`,
          },
          (payload) => {
            console.log('Message updated on whistleblower side:', payload.new);
            const updatedMsg = payload.new as Message;
            setMessages(prev => prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg));
          }
        )
        .subscribe((status) => {
          console.log('Whistleblower messaging subscription status:', status);
        });

      return () => {
        console.log('Cleaning up whistleblower messaging subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [report?.id]);

  const findReport = async () => {
    if (!trackingId.trim()) {
      toast({
        title: "Error",
        description: "Please enter your tracking ID",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      console.log('Searching for report with tracking ID:', trackingId);
      
      const { data, error } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, organization_id')
        .eq('tracking_id', trackingId.trim())
        .single();

      if (error || !data) {
        console.error('Report not found:', error);
        toast({
          title: "Report not found",
          description: "No report found with that tracking ID",
          variant: "destructive",
        });
        return;
      }

      // Check if report is archived - don't show to whistleblowers
      if (data.status === 'archived') {
        console.log('Report is archived, not showing to whistleblower');
        toast({
          title: "Case Not Found",
          description: "Your case was either resolved or removed. Please submit a new case or check your case ID.",
          variant: "destructive",
        });
        return;
      }

      console.log('Report found:', data);
      setReport(data);
      toast({
        title: "Success",
        description: "Report found! You can now view and send messages.",
      });

    } catch (error) {
      console.error('Error finding report:', error);
      toast({
        title: "Error",
        description: "Failed to find report",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const fetchMessages = async () => {
    if (!report) return;

    setIsLoading(true);
    try {
      console.log('Fetching messages for report:', report.id);
      
      // Use Edge Function for encrypted message loading
      const { data: result, error } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'load',
          trackingId: report.tracking_id
        }
      });

      if (error) {
        log.error('MESSAGING', 'Failed to load messages via Edge Function', error, { 
          reportId: report.id, 
          trackingId: report.tracking_id 
        });
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      log.info('MESSAGING', 'Messages loaded successfully via Edge Function', { 
        reportId: report.id, 
        trackingId: report.tracking_id,
        messageCount: result?.messages?.length || 0 
      });
      console.log('Messages loaded:', result?.messages);
      setMessages(result?.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!report) {
      toast({
        title: "Error",
        description: "No report selected",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('Sending message for report:', report.id);
      
      // Use Edge Function for encrypted message sending
      const { data, error } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'send',
          trackingId: report.tracking_id,
          message: newMessage.trim()
        }
      });

      if (error) {
        log.error('MESSAGING', 'Failed to send message via Edge Function', error, { 
          reportId: report.id, 
          trackingId: report.tracking_id,
          messageLength: newMessage.trim().length 
        });
        console.error('Error sending message:', error);
        throw error;
      }

      log.info('MESSAGING', 'Message sent successfully via Edge Function', { 
        reportId: report.id, 
        trackingId: report.tracking_id,
        messageLength: newMessage.trim().length 
      });
      console.log('Message sent successfully');
      
      // Log message to audit trail
      if (report.organization_id) {
        await auditLogger.log({
          eventType: 'report.message_sent',
          category: 'case_management',
          action: 'Whistleblower sent message',
          severity: 'low',
          actorType: 'user',
          actorEmail: 'whistleblower',
          targetType: 'report',
          targetId: report.id,
          targetName: report.tracking_id,
          summary: `Whistleblower sent message on report ${report.tracking_id}`,
          description: 'Message sent via whistleblower messaging interface',
          metadata: {
            message_length: newMessage.trim().length,
            sender_type: 'whistleblower',
            report_status: report.status,
          },
          organizationId: report.organization_id,
        });
      }
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setNewMessage('');
      // Don't refresh messages here - let the real-time subscription handle it

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Tracking ID Search */}
      {!report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Access Your Report
            </CardTitle>
            <CardDescription>
              Enter your tracking ID to view your report and communicate securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trackingId">Tracking ID</Label>
              <Input
                id="trackingId"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter your tracking ID (e.g., WB-ABC12345)"
                onKeyPress={(e) => e.key === 'Enter' && findReport()}
              />
            </div>
            <Button 
              onClick={findReport} 
              disabled={isSearching || !trackingId.trim()}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Find Report'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Report Found - Show Messages */}
      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Secure Communication
                </CardTitle>
                <CardDescription>
                  Report: {report.title} (ID: {report.tracking_id})
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setReport(null);
                  setMessages([]);
                  setTrackingId('');
                }}
              >
                Back to Search
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages Display */}
            <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Send a message to start the conversation.</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender_type === 'whistleblower'
                          ? 'bg-green-50 ml-8 border-l-4 border-green-500'
                          : 'bg-gray-50 mr-8 border-l-4 border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">
                          {message.sender_type === 'whistleblower' ? 'You' : 'Organization'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.encrypted_message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="newMessage">Send a secure message</Label>
              <Textarea
                id="newMessage"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                rows={3}
                disabled={isSending}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-1" />
                  Messages are encrypted end-to-end
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={isSending || !newMessage.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhistleblowerMessaging;
