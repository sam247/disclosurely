import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Search, 
  User, 
  Mail, 
  Calendar,
  Eye,
  Archive,
  RefreshCw,
  Send,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  human_requested?: boolean;
  human_requested_at?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

const ChatAdminView = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Use service role to access all conversations across all organizations
      // This is for Disclosurely internal team only
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(500);

      if (statusFilter === 'human_requested') {
        query = query.eq('human_requested', true);
      } else if (statusFilter !== 'all') {
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
      setMessages((data || []) as ChatMessage[]);
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

  const handleSendReply = async () => {
    if (!selectedConversation || !replyMessage.trim() || sendingReply) return;

    const messageText = replyMessage.trim();
    setReplyMessage('');
    setSendingReply(true);

    try {
      // Insert admin reply directly as 'assistant' message (no AI processing)
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation.id,
          role: 'assistant',
          content: messageText,
          metadata: {
            sender_type: 'admin',
            sender_email: 'admin@disclosurely.com'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      // Refresh messages to show the new reply
      await fetchMessages(selectedConversation.id);
      
      // Refresh conversations list to update the updated_at timestamp
      await fetchConversations();
      
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    } catch (error: any) {
      console.error('Error sending reply:', error);
      setReplyMessage(messageText); // Restore message on error
      toast({
        title: "Error",
        description: error.message || "Failed to send reply. Please check RLS policies.",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      // Use RPC function or direct update - need to check RLS policies
      // For admin, we may need to use service role or an RPC function
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) {
        console.error('Archive error:', error);
        // If RLS blocks, try using an edge function
        const { error: rpcError } = await supabase.functions.invoke('update-chat-status', {
          body: { conversation_id: conversationId, status: 'archived' }
        }).catch(() => ({ error: null }));
        
        if (rpcError) {
          throw new Error(error.message || 'Failed to archive conversation');
        }
      }

      toast({
        title: "Success",
        description: "Conversation archived",
      });

      // Refresh conversations list
      await fetchConversations();
      
      // Clear selected conversation if it was archived
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      } else {
        // Update selected conversation status if it's still selected
        setSelectedConversation(prev => prev ? { ...prev, status: 'archived' } : null);
      }
    } catch (error: any) {
      console.error('Archive error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to archive conversation. Please check RLS policies.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to permanently delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      // Use edge function with service role to bypass RLS
      const { data, error } = await supabase.functions.invoke('delete-chat-conversation', {
        body: { conversationId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "Conversation deleted permanently",
      });

      // Refresh conversations list
      await fetchConversations();
      
      // Clear selected conversation if it was deleted
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete conversation. Please try again.",
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
        {/* Header - Fixed */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
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

        {/* Filters - Fixed */}
        <Card className="flex-shrink-0">
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
                <Button
                  variant={statusFilter === 'human_requested' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('human_requested')}
                >
                  Human Requested
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List - Scrollable */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Conversations */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <Card className="flex flex-col flex-1 min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <CardDescription>
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-2 pr-4">
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
                                conv.human_requested ? 'destructive' :
                                conv.status === 'active' ? 'default' :
                                conv.status === 'closed' ? 'secondary' :
                                'outline'
                              }
                              className="text-xs flex-shrink-0"
                            >
                              {conv.human_requested ? 'Human Requested' : conv.status}
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

          {/* Messages - Scrollable */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card className="flex flex-col flex-1 min-h-0">
              <CardHeader className="flex-shrink-0">
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await handleArchiveConversation(selectedConversation.id);
                        }}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          await handleDeleteConversation(selectedConversation.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden flex flex-col p-0">
                {selectedConversation ? (
                  <>
                    <ScrollArea className="flex-1 min-h-0 px-6 py-4">
                      <div className="space-y-4 pr-4">
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
                    {/* Reply Input */}
                    <div className="border-t p-4 flex-shrink-0">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                          className="min-h-[60px] resize-none"
                          disabled={sendingReply}
                        />
                        <Button
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim() || sendingReply}
                          size="icon"
                          className="h-[60px] w-[60px] flex-shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
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
  );
};

export default ChatAdminView;

