
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
  encryptionKey: string;
}

const ReportMessaging = ({ reportId, trackingId, encryptionKey }: ReportMessagingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

      if (error) throw error;
      setMessages(data || []);
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
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      // Encrypt the message using the report's encryption key
      const encryptedMessage = encryptData(newMessage, encryptionKey);

      const { error } = await supabase
        .from('report_messages')
        .insert({
          report_id: reportId,
          encrypted_message: encryptedMessage,
          sender_type: 'organization',
          sender_id: user.id
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent securely",
      });
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

  const decryptMessage = (encryptedMessage: string): string => {
    try {
      return decryptData(encryptedMessage, encryptionKey);
    } catch (error) {
      console.error('Error decrypting message:', error);
      return '[Message could not be decrypted - invalid key]';
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
                    {decryptMessage(message.encrypted_message)}
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
  );
};

export default ReportMessaging;
