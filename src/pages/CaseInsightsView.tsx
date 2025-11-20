import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { CaseCard } from '@/components/CaseCard';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cases?: Array<{
    id: string;
    tracking_id: string;
    title: string;
    status: string;
    priority: number;
    created_at: string;
    similarity?: number;
  }>;
  timestamp: Date;
}

const SUGGESTED_QUERIES = [
  "Show me fraud cases from Q4",
  "What's my average resolution time?",
  "Cases by department",
  "High priority unresolved cases",
  "All cases assigned to me",
  "Cases created in the last 30 days"
];

const CaseInsightsView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update empty state based on messages
  useEffect(() => {
    setIsEmptyState(messages.length === 0);
  }, [messages]);

  const handleQuery = async (query: string) => {
    if (!query.trim() || isLoading || !organization?.id) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rag-case-query', {
        body: {
          query: query.trim(),
          organizationId: organization.id
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'No response generated',
        cases: data.cases || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error querying cases:', error);
      toast({
        title: "Query Failed",
        description: error.message || "Failed to process query. Please try again.",
        variant: "destructive",
      });

      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleQuery(suggestion);
  };

  const handleClearChat = () => {
    setMessages([]);
    setIsEmptyState(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery(inputQuery);
    }
  };

  // Empty State UI
  if (isEmptyState) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Search className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Case Insights</h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Ask questions about your cases and get instant insights
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <div className="flex gap-2">
              <Input
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your cases..."
                className="h-12 text-base"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleQuery(inputQuery)}
                disabled={!inputQuery.trim() || isLoading}
                size="lg"
                className="h-12 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Or try one of these:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUERIES.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface UI
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Query and analyze all your cases
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleClearChat}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      <Card className="h-[calc(100vh-250px)] flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className="max-w-[85%] space-y-3">
                  <div
                    className={cn(
                      'rounded-lg px-5 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground border'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {message.content}
                    </p>
                    <p className={cn(
                      'text-xs mt-2',
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Case Cards for AI responses */}
                  {message.role === 'assistant' && message.cases && message.cases.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      {message.cases.map((caseData) => (
                        <CaseCard
                          key={caseData.id}
                          caseId={caseData.id}
                          trackingId={caseData.tracking_id}
                          title={caseData.title}
                          status={caseData.status}
                          priority={caseData.priority}
                          created_at={caseData.created_at}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3 border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Searching your cases...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask another question about your cases..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleQuery(inputQuery)}
                disabled={!inputQuery.trim() || isLoading}
                size="default"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by AI • Your queries are logged for audit purposes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseInsightsView;

