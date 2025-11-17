import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface ChatWidgetProps {
  /**
   * Whether the chat widget is visible
   */
  enabled?: boolean;
  /**
   * Custom API endpoint or script URL for BYOK Chat
   * If not provided, will check VITE_CHAT_WIDGET_URL environment variable
   */
  chatUrl?: string;
  /**
   * Custom styling class names
   */
  className?: string;
  /**
   * Position of the chat button (bottom-right, bottom-left, etc.)
   */
  position?: 'bottom-right' | 'bottom-left';
  /**
   * Custom title for the chat window
   */
  title?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * ChatWidget - AI-powered support chat using DeepSeek API
 * Designed to work on both marketing site and dashboard.
 */
const ChatWidget = ({ 
  enabled = true, 
  chatUrl,
  className,
  position = 'bottom-right',
  title = 'Disclosurely Chat'
}: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [humanRequested, setHumanRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { organization } = useOrganization();
  const { data: chatWidgetEnabled } = useFeatureFlag('chat_widget', organization?.id);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history if conversationId exists
  useEffect(() => {
    if (conversationId && isOpen) {
      loadConversationHistory();
    }
  }, [conversationId, isOpen]);

  const loadConversationHistory = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at)
        })));
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('chat-support', {
        body: {
          action: 'send',
          message: userMessage,
          conversationId: conversationId,
          userId: user?.id || null,
          userEmail: user?.email || null,
          userName: user?.user_metadata?.full_name || null,
        }
      });

      if (error) throw error;

      if (data) {
        // Update conversation ID if this is a new conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        // Add AI response
        const aiMessage: ChatMessage = {
          id: data.messageId || `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const requestHuman = async () => {
    if (!conversationId) {
      toast({
        title: "Error",
        description: "Please start a conversation first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Call edge function to mark conversation as needing human
      const { data, error } = await supabase.functions.invoke('chat-support', {
        body: {
          action: 'request_human',
          conversationId: conversationId,
          userId: user?.id || null,
          userEmail: user?.email || null,
          userName: user?.user_metadata?.full_name || null,
        }
      });

      if (error) throw error;

      setHumanRequested(true);
      
      // Show confirmation message
      const confirmationMessage: ChatMessage = {
        id: `human-request-${Date.now()}`,
        role: 'assistant',
        content: 'A human agent will be with you shortly. Expected wait time: 3-4 minutes. Please keep this chat open.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);

      toast({
        title: "Request Sent",
        description: "A human agent will join the conversation shortly",
      });
    } catch (error: any) {
      console.error('Error requesting human:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to request human agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!enabled) return null;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-2 sm:right-4',
    'bottom-left': 'bottom-4 left-2 sm:left-4',
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          positionClasses[position],
          className
        )}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200',
            'w-[calc(100vw-2rem)] sm:w-96',
            'h-[70vh] sm:h-[600px] max-h-[600px]',
            'flex flex-col',
            position === 'bottom-right' ? 'bottom-20 sm:bottom-20 right-2 sm:right-4' : 'bottom-20 sm:bottom-20 left-2 sm:left-4',
            'max-w-full'
          )}
        >
          {/* Chat Header */}
          <div className="flex flex-col p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/80 mt-1 ml-7">All chats are encrypted and confidential</p>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <MessageCircle className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Ask Me Anything</h4>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Tell me about your business challenges and I'll explain how Disclosurely can help!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-5 py-3 text-base',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={cn(
                      'text-xs mt-2',
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            {humanRequested && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium">
                  Human agent requested • Expected wait: 3-4 minutes
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[40px] max-h-[120px]"
                rows={1}
                disabled={isLoading || humanRequested}
              />
              {!humanRequested && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestHuman}
                  disabled={!conversationId || isLoading}
                  className="shrink-0"
                  title="Speak to a human agent"
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || humanRequested}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by Disclosurely • <a href="mailto:support@disclosurely.com" className="text-primary hover:underline">Email support</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

