
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { encryptMessage, decryptMessage } from '@/utils/encryption';
import type { ReportMessage } from '@/types/database';

interface SecureMessagingProps {
  reportId: string;
}

interface Message {
  id: string;
  created_at: string;
  sender_type: string;
  encrypted_message: string;
  sender_id: string | null;
  decrypted_message?: string;
}

const SecureMessaging = ({ reportId }: SecureMessagingProps) => {
  const { user } = useAuth();
  const { createAuditLog } = useAuditLog();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');

  useEffect(() => {
    if (reportId) {
      fetchMessages();
      fetchEncryptionKey();
    }
  }, [reportId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report_messages')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Decrypt messages
      const decryptedMessages = await Promise.all(
        data.map(async (msg) => ({
          ...msg,
          decrypted_message: await decryptMessage(msg.encrypted_message, encryptionKey),
        }))
      );

      setMessages(decryptedMessages as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEncryptionKey = async () => {
    // Placeholder for fetching encryption key
    setEncryptionKey('testkey');
  };

  const sendMessage = async () => {
    if (!message.trim() || !reportId) return;

    try {
      setSending(true);

      // Encrypt the message
      const encryptedMessage = await encryptMessage(message);

      // Insert the message
      const { error } = await supabase
        .from('report_messages')
        .insert({
          report_id: reportId,
          sender_type: 'handler',
          sender_id: user?.id,
          encrypted_message: encryptedMessage.encryptedData,
        });

      if (error) throw error;

      // Create audit log
      await createAuditLog('message_sent', reportId, { 
        sender_type: 'handler',
        message_length: message.length 
      });

      setMessage('');
      await fetchMessages();
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Secure Messaging
        </CardTitle>
        <CardDescription>
          Communicate securely with the whistleblower regarding this report.
          <br />
          <Badge variant="secondary">
            <Lock className="h-3 w-3 mr-1" />
            End-to-end encrypted
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-md ${msg.sender_type === 'handler' ? 'bg-blue-50 text-blue-800 ml-auto w-fit max-w-[80%]' : 'bg-gray-100 text-gray-800 mr-auto w-fit max-w-[80%]'
                  }`}
              >
                <div className="text-sm">
                  {msg.decrypted_message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {msg.sender_type === 'handler' ? 'You' : 'Whistleblower'} - {format(new Date(msg.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button onClick={sendMessage} disabled={sending}>
          {sending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Message
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecureMessaging;
