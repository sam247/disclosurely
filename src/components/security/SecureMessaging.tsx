
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSecureForm } from '@/hooks/useSecureForm';
import { sanitizeHtml } from '@/utils/inputValidation';
import TranslateButton from '@/components/TranslateButton';
import { auditLogger } from '@/utils/auditLogger';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  report_type: string;
  encrypted_content: string;
  organizations: {
    name: string;
  };
}

interface Message {
  id: string;
  sender_type: string;
  encrypted_message: string;
  decrypted_message?: string;
  created_at: string;
  is_read: boolean;
  sender_id: string | null;
}

interface SecureMessagingProps {
  report: Report;
  onClose: () => void;
}

const SecureMessaging = ({ report, onClose }: SecureMessagingProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});

  const { isSubmitting, secureSubmit } = useSecureForm({
    rateLimitKey: `messaging_${report.id}`,
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000 // 5 minutes
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    
    // Disabled real-time subscription to avoid encrypted message display issues
    // Messages are refreshed manually after sending to ensure decrypted content
    // const channel = supabase
    //   .channel(`report-messages-secure-${report.id}`)
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'INSERT',
    //       schema: 'public',
    //       table: 'report_messages',
    //       filter: `report_id=eq.${report.id}`,
    //     },
    //     (payload) => {
    //       console.log('New message received:', payload.new);
    //       const newMsg = payload.new as Message;
    //       setMessages(prev => {
    //         // Check if message already exists to prevent duplicates
    //         if (prev.some(msg => msg.id === newMsg.id)) {
    //           return prev;
    //         }
    //         return [...prev, newMsg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    //       });
    //     }
    //   )
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'UPDATE',
    //       schema: 'public',
    //       table: 'report_messages',
    //       filter: `report_id=eq.${report.id}`,
    //     },
    //     (payload) => {
    //       console.log('Message updated:', payload.new);
    //       const updatedMsg = payload.new as Message;
    //       setMessages(prev => prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg));
    //     }
    //   )
    //   .subscribe((status) => {
    //     console.log('Secure messaging subscription status:', status);
    //   });

    // return () => {
    //   console.log('Cleaning up secure messaging subscription');
    //   supabase.removeChannel(channel);
    // };
  }, [report.id]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for report:', report.id);
      
      // Use Edge Function for encrypted message loading instead of direct database query
      const { data: result, error } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'load',
          trackingId: report.tracking_id
        }
      });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      console.log('Messages loaded:', result?.messages);
      setMessages(result?.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateMessage = (data: { message: string }) => {
    if (!data.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return false;
    }

    if (data.message.length > 5000) {
      toast({
        title: "Error",
        description: "Message is too long (max 5000 characters)",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const submitMessage = async (data: { message: string }) => {
    console.log('Sending secure message for report:', report.id);
    
    // Use Edge Function for encrypted messaging instead of direct database insert
    const { data: result, error } = await supabase.functions.invoke('anonymous-report-messaging', {
      body: {
        action: 'send',
        trackingId: report.tracking_id,
        message: data.message,
        senderType: 'organization' // ✅ Dashboard user is organization/case handler
      }
    });

    if (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }

    console.log('Message sent successfully');
    
    // Log to audit trail
    if (user && organization?.id) {
      await auditLogger.log({
        eventType: 'report.message_sent',
        category: 'case_management',
        action: 'Organization sent message',
        severity: 'low',
        actorType: 'user',
        actorId: user.id,
        actorEmail: user.email,
        targetType: 'report',
        targetId: report.id,
        targetName: report.tracking_id,
        summary: `Organization sent message on report ${report.tracking_id}`,
        description: 'Message sent via secure messaging interface',
        metadata: {
          message_length: data.message.length,
          sender_type: 'organization',
          report_status: report.status,
        },
        organizationId: organization.id,
      });
    }
    
    toast({
      title: "Success",
      description: "Message sent successfully",
    });

    setNewMessage('');
    // Refresh messages to get the decrypted version
    await fetchMessages();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    secureSubmit(submitMessage, { message: newMessage.trim() }, validateMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading messages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm">
            {t('messagesEncrypted')}
          </CardDescription>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Display */}
        <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation by sending a message below.</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.sender_type === 'organization'
                      ? 'bg-blue-50 ml-8 border-l-4 border-blue-500'
                      : 'bg-gray-50 mr-8 border-l-4 border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">
                      {message.sender_type === 'organization' ? 'You' : 'Whistleblower'}
                    </span>
                    <div className="flex items-center gap-2">
                      <TranslateButton
                        text={message.encrypted_message}
                        onTranslated={(translated) => {
                          setTranslatedMessages(prev => ({
                            ...prev,
                            [message.id]: translated
                          }));
                        }}
                        onShowOriginal={() => {
                          setTranslatedMessages(prev => {
                            const newState = { ...prev };
                            delete newState[message.id];
                            return newState;
                          });
                        }}
                        isTranslated={!!translatedMessages[message.id]}
                        size="sm"
                        variant="ghost"
                      />
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHtml(translatedMessages[message.id] || message.decrypted_message || message.encrypted_message)
                    }}
                  />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="newMessage">{t('sendMessage')}</Label>
          <Textarea
            id="newMessage"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('typeYourMessage')}
            rows={3}
            disabled={isSubmitting}
            maxLength={5000}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="break-words">{t('messagesEncrypted')}</span>
            </div>
            <Button 
              type="submit"
              disabled={isSubmitting || !newMessage.trim()}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending...' : t('sendMessage')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureMessaging;
