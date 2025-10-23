import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Lock, Clock, User, Shield } from 'lucide-react';

interface Message {
  id: string;
  encrypted_message: string;
  decrypted_message?: string;
  sender_type: 'whistleblower' | 'organization';
  created_at: string;
  is_read: boolean;
  sender_id: string | null;
}

interface Report {
  id: string;
  tracking_id: string;
  title: string;
  status: string;
  created_at: string;
}

const SecureMessaging = () => {
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const verifyAndLoadReport = async () => {
    if (!trackingId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide tracking ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use the anonymous-report-messaging function to load report and messages
      const { data, error } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'load',
          trackingId: trackingId.toUpperCase()
        }
      });

      if (error) {
        console.error('Error loading report:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load report",
          variant: "destructive",
        });
        return;
      }

      if (!data || !data.report) {
        toast({
          title: "Report Not Found",
          description: "No report found with this tracking ID",
          variant: "destructive",
        });
        return;
      }

      setReport(data.report);
      setMessages(data.messages || []);
      
      toast({
        title: "Report Loaded",
        description: "Report and messages loaded successfully",
      });
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !report) return;

    setIsSending(true);
    try {
      // Use the anonymous-report-messaging function to send message
      const { data, error } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'send',
          trackingId: report.tracking_id,
          message: newMessage.trim()
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setNewMessage('');
      
      // Reload messages to get the updated list
      const { data: reloadData, error: reloadError } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'load',
          trackingId: report.tracking_id
        }
      });

      if (!reloadError && reloadData?.messages) {
        setMessages(reloadData.messages);
      }
      
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Secure Communication Portal</CardTitle>
              <CardDescription>
                Access your report and communicate securely with the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tracking-id">Report Tracking ID</Label>
                  <Input
                    id="tracking-id"
                    placeholder="Enter your tracking ID (e.g., WB-A1B2C3D4)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={verifyAndLoadReport}
                disabled={isLoading || !trackingId.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Access Report
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <Shield className="inline h-4 w-4 mr-1" />
                All communications are end-to-end encrypted
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Tracking ID</Label>
                  <p className="font-mono text-sm">{report.tracking_id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Title</Label>
                  <p className="text-sm">{report.title}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Submitted</Label>
                  <p className="text-sm">{formatDate(report.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Secure Messages</span>
                </CardTitle>
                <CardDescription>
                  Communicate securely with the organization handling your report
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No messages yet. Start a conversation by sending a message below.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'whistleblower' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_type === 'whistleblower'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.sender_type === 'whistleblower' ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Shield className="h-3 w-3" />
                            )}
                            <span className="text-xs opacity-75">
                              {message.sender_type === 'whistleblower' ? 'You' : 'Organization'}
                            </span>
                          </div>
                          <p className="text-sm">{message.decrypted_message || message.encrypted_message}</p>
                          <p className="text-xs opacity-75 mt-1">
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
                    placeholder="Type your secure message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Secure Message
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureMessaging;
