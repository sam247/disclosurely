
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { encryptData, decryptData } from '@/utils/encryption';
import { MessageSquare, Send, Lock, User, Shield, Clock } from 'lucide-react';

interface Message {
  id: string;
  encrypted_message: string;
  sender_type: 'whistleblower' | 'organization';
  created_at: string;
  is_read: boolean;
  sender_id: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface ReportMessagingProps {
  reportId: string;
  trackingId: string;
  encryptedContent: string;
  status: string;
  title: string;
  reportType: string;
  createdAt: string;
  priority: number;
}

const ReportMessaging = ({ 
  reportId, 
  trackingId, 
  encryptedContent,
  status,
  title,
  reportType,
  createdAt,
  priority
}: ReportMessagingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // For dashboard users, we'll use a placeholder encryption key since they're viewing through the dashboard
  // In a production system, you'd implement proper key management
  const encryptionKey = "dashboard-access-key";

  useEffect(() => {
    loadMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`report-messages-${reportId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report_messages',
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('report_messages')
        .select(`
          *,
          profiles:sender_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }
      
      // Type assertion to ensure sender_type is properly typed
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'whistleblower' | 'organization'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
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

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // For dashboard users, we'll store the message in plain text for now
      // In production, implement proper encryption key management
      const messageToStore = newMessage;

      console.log('Attempting to send message with:', {
        report_id: reportId,
        sender_type: 'organization',
        sender_id: user.id,
        message_length: newMessage.length
      });

      const { data, error } = await supabase
        .from('report_messages')
        .insert({
          report_id: reportId,
          encrypted_message: messageToStore,
          sender_type: 'organization',
          sender_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Message sent successfully:', data);
      setNewMessage('');
      await loadMessages();
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent securely",
      });
    } catch (error) {
      console.error('Complete error object:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSenderName = (message: Message): string => {
    if (message.sender_type === 'whistleblower') {
      return 'Whistleblower';
    } else if (message.profiles) {
      return `${message.profiles.first_name || ''} ${message.profiles.last_name || ''}`.trim() || 
             message.profiles.email;
    }
    return 'Organization';
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>Report ID: {trackingId}</CardDescription>
            </div>
            <Badge className={getStatusColor(status)}>
              {formatStatus(status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium capitalize">{reportType}</p>
            </div>
            <div>
              <span className="text-gray-500">Priority:</span>
              <p className="font-medium">Level {priority}</p>
            </div>
            <div>
              <span className="text-gray-500">Submitted:</span>
              <p className="font-medium">{new Date(createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Messages:</span>
              <p className="font-medium">{messages.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Secure Messages</span>
            <Lock className="h-4 w-4 text-gray-500" />
          </CardTitle>
          <CardDescription>
            End-to-end encrypted communication with the whistleblower
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start the conversation by sending a message below.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_type === 'organization' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender_type === 'organization'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.sender_type === 'whistleblower' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium opacity-90">
                        {getSenderName(message)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {message.encrypted_message}
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="Type your secure message to the whistleblower..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Lock className="h-4 w-4" />
                <span>Messages are encrypted end-to-end</span>
              </div>
              <Button 
                onClick={sendMessage}
                disabled={isSending || !newMessage.trim()}
                size="sm"
              >
                {isSending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportMessaging;
