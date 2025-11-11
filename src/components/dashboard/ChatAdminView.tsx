import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Search, 
  User, 
  Mail, 
  Calendar,
  Eye,
  Archive,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChatConversation {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

const ChatAdminView = () => {
  const { isOrgAdmin } = useUserRoles();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isOrgAdmin) {
      fetchConversations();
    }
  }, [isOrgAdmin, statusFilter]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get message counts for each conversation
      if (data) {
        const conversationsWithCounts = await Promise.all(
          data.map(async (conv) => {
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id);
            
            return {
              ...conv,
              message_count: count || 0
            };
          })
        );
        setConversations(conversationsWithCounts);
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleViewConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Conversation archived",
      });

      fetchConversations();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.user_email?.toLowerCase().includes(query) ||
        conv.user_name?.toLowerCase().includes(query) ||
        conv.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOrgAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Chat Admin</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Access restricted to organization administrators
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Chat Support Admin</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              View and manage support chat conversations
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, name, or conversation ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'closed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('closed')}
                >
                  Closed
                </Button>
                <Button
                  variant={statusFilter === 'archived' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('archived')}
                >
                  Archived
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
                <CardDescription>
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={cn(
                            'p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors',
                            selectedConversation?.id === conv.id && 'bg-muted border-primary'
                          )}
                          onClick={() => handleViewConversation(conv)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {conv.user_email ? (
                                  <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                )}
                                <p className="text-sm font-medium truncate">
                                  {conv.user_name || conv.user_email || 'Anonymous'}
                                </p>
                              </div>
                              {conv.user_email && conv.user_name && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {conv.user_email}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {conv.message_count || 0} messages
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(conv.updated_at)}
                              </p>
                            </div>
                            <Badge
                              variant={
                                conv.status === 'active' ? 'default' :
                                conv.status === 'closed' ? 'secondary' :
                                'outline'
                              }
                              className="text-xs flex-shrink-0"
                            >
                              {conv.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation ? 'Conversation' : 'Select a conversation'}
                    </CardTitle>
                    <CardDescription>
                      {selectedConversation && (
                        <>
                          {selectedConversation.user_name || selectedConversation.user_email || 'Anonymous'}
                          {selectedConversation.user_email && selectedConversation.user_name && (
                            <> • {selectedConversation.user_email}</>
                          )}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  {selectedConversation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchiveConversation(selectedConversation.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            'flex',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            )}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className={cn(
                              'text-xs mt-1',
                              message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[600px] text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Select a conversation to view messages
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAdminView;

