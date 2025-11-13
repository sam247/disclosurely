
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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
  const location = useLocation();
  const { data: secureMessagingEnabled, isLoading: secureMessagingLoading } = useFeatureFlag('secure_messaging', organization?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const fetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isSubmitting, secureSubmit } = useSecureForm({
    rateLimitKey: `messaging_${report.id}`,
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000 // 5 minutes
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll if messages exist and component is mounted
    if (messages.length > 0 && !isLoading) {
    scrollToBottom();
    }
  }, [messages, isLoading]);

  const fetchMessages = useCallback(async () => {
    // Prevent multiple simultaneous fetches using ref instead of state
    // Also prevent fetching during navigation transitions (eager gestures)
    if (fetchingRef.current || !isMountedRef.current || isNavigatingRef.current) {
      
      return;
    }
    
    try {
      fetchingRef.current = true;
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      
      
      // Use Edge Function for encrypted message loading instead of direct database query
      const { data: result, error } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'load',
          trackingId: report.tracking_id
        }
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        
        return;
      }

      if (error) {
        console.error('Error fetching messages:', error);
        if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        }
        return;
      }

      
      if (isMountedRef.current) {
      setMessages(result?.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (isMountedRef.current) {
      setIsLoading(false);
    }
      fetchingRef.current = false;
    }
  }, [report.id, report.tracking_id, toast]);

  useEffect(() => {
    // Only fetch messages once when component mounts or report.id changes
    isMountedRef.current = true;
    
    const loadMessages = async () => {
      if (isMountedRef.current && !fetchingRef.current) {
        await fetchMessages();
      }
    };
    
    loadMessages();
    
    return () => {
      // Mark component as unmounted immediately
      isMountedRef.current = false;
      // Reset fetching ref when component unmounts to prevent stale state
      fetchingRef.current = false;
    };
  }, [report.id, fetchMessages]);

  // Reset mounted ref when location changes (handles browser back navigation)
  // Also set navigation flag to prevent eager gestures during transition
  useEffect(() => {
    // Set navigation flag immediately when location starts changing
    isNavigatingRef.current = true;
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    // Reset navigation flag after transition completes (1000ms to handle eager gestures)
    navigationTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
    
    return () => {
      isMountedRef.current = false;
      fetchingRef.current = false;
      isNavigatingRef.current = true; // Keep true during unmount
      
      // Clear timeout on cleanup
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, [location.pathname]);

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

  if (isLoading || secureMessagingLoading) {
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

  // Check feature flag
  if (secureMessagingEnabled === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5" />
            {t('secureMessaging')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Secure messaging feature is currently disabled. Please contact support if you need access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="h-5 w-5" />
              {t('secureMessaging')}
            </CardTitle>
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
              loading={isSubmitting}
              loadingText="Sending..."
              disabled={!newMessage.trim()}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              {t('sendMessage')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureMessaging;
