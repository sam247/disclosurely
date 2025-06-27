
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  FileText, 
  UserPlus, 
  Clock, 
  Send, 
  MessageSquare, 
  Lock, 
  Trash2,
  Archive
} from 'lucide-react';
import { format } from 'date-fns';
import { decryptReport } from '@/utils/encryption';
import type { Report, ReportStatus } from '@/types/database';

interface ReportWithAssignee extends Report {
  assignee_profile: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface Message {
  id: string;
  sender_type: string;
  encrypted_message: string;
  created_at: string;
  is_read: boolean;
  sender_id: string | null;
}

interface ReportViewModalProps {
  report: ReportWithAssignee | null;
  isOpen: boolean;
  onClose: () => void;
  onReportUpdated: () => void;
  users: { id: string; email: string; first_name: string | null; last_name: string | null; }[];
}

const ReportViewModal = ({ report, isOpen, onClose, onReportUpdated, users }: ReportViewModalProps) => {
  const { user } = useAuth();
  const { createAuditLog } = useAuditLog();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<any>(null);
  const [showContent, setShowContent] = useState(false);

  const reportStatuses: { value: ReportStatus; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'in_review', label: 'In Review' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  useEffect(() => {
    if (report && isOpen) {
      fetchMessages();
      decryptReportContent();
    }
  }, [report, isOpen]);

  const decryptReportContent = async () => {
    if (!report || !user) return;
    
    try {
      // Get user's organization ID for decryption
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        const decrypted = decryptReport(report.encrypted_content, profile.organization_id);
        setDecryptedContent(decrypted);
      }
    } catch (error) {
      console.error('Error decrypting content:', error);
    }
  };

  const fetchMessages = async () => {
    if (!report) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report_messages')
        .select('*')
        .eq('report_id', report.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (newStatus: ReportStatus) => {
    if (!report) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', report.id);

      if (error) throw error;

      await createAuditLog('status_changed', report.id, { 
        old_status: report.status,
        new_status: newStatus 
      });

      onReportUpdated();
      toast({
        title: "Success",
        description: "Report status updated successfully",
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  const assignReport = async (userId: string) => {
    if (!report) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ assigned_to: userId })
        .eq('id', report.id);

      if (error) throw error;

      await createAuditLog('assigned', report.id, { 
        assigned_to: userId,
        assigned_by: user?.id 
      });

      onReportUpdated();
      toast({
        title: "Success",
        description: "Report assigned successfully",
      });
    } catch (error) {
      console.error('Error assigning report:', error);
      toast({
        title: "Error",
        description: "Failed to assign report",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !report) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('report_messages')
        .insert({
          report_id: report.id,
          sender_type: 'organization',
          encrypted_message: newMessage.trim(),
          sender_id: user?.id
        });

      if (error) throw error;

      await createAuditLog('message_sent', report.id, { 
        sender_type: 'organization',
        message_length: newMessage.length 
      });

      setNewMessage('');
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

  const deleteReport = async () => {
    if (!report) return;

    try {
      // First delete related records to avoid constraint violations
      await supabase.from('report_messages').delete().eq('report_id', report.id);
      await supabase.from('report_notes').delete().eq('report_id', report.id);
      await supabase.from('report_attachments').delete().eq('report_id', report.id);
      await supabase.from('notifications').delete().eq('report_id', report.id);
      
      // Delete audit logs last, but before the report
      await supabase.from('audit_logs').delete().eq('report_id', report.id);
      
      // Finally delete the report
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);

      if (error) throw error;

      onReportUpdated();
      onClose();
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const archiveReport = async () => {
    if (!report) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'closed' })
        .eq('id', report.id);

      if (error) throw error;

      await createAuditLog('updated', report.id, { 
        action: 'archived',
        archived_by: user?.id 
      });

      onReportUpdated();
      onClose();
      toast({
        title: "Success",
        description: "Report archived successfully",
      });
    } catch (error) {
      console.error('Error archiving report:', error);
      toast({
        title: "Error",
        description: "Failed to archive report",
        variant: "destructive",
      });
    }
  };

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Details - {report.tracking_id}
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to archive this report? This will mark it as closed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={archiveReport}>Archive</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this report? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteReport}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Report Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <div className="text-gray-700 mt-1">{report.title}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Tracking ID</Label>
              <div className="text-gray-700 mt-1">{report.tracking_id}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={report.status}
                onValueChange={(value) => updateReportStatus(value as ReportStatus)}
              >
                <SelectTrigger className="w-48 mt-1">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Assign To</Label>
              <Select
                value={report.assigned_to || ''}
                onValueChange={(value) => assignReport(value)}
              >
                <SelectTrigger className="w-48 mt-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Report Content</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContent(!showContent)}
                >
                  {showContent ? 'Hide Content' : 'Show Content'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showContent && (
              <CardContent>
                {decryptedContent ? (
                  <div className="space-y-3">
                    {Object.entries(decryptedContent).map(([key, value]) => (
                      <div key={key}>
                        <Label className="capitalize text-gray-600 font-medium">
                          {key.replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ')}:
                        </Label>
                        <p className="mt-1 whitespace-pre-wrap text-sm">
                          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Unable to decrypt content</p>
                    <p className="text-sm text-gray-500">Please ensure you have proper access permissions</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Messages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Secure Communication
              </CardTitle>
              <CardDescription>
                End-to-end encrypted communication with the whistleblower
                <Badge variant="secondary" className="ml-2">
                  <Lock className="h-3 w-3 mr-1" />
                  Encrypted
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages Display */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender_type === 'organization'
                          ? 'bg-blue-50 ml-8 border-l-4 border-blue-500'
                          : 'bg-gray-50 mr-8 border-l-4 border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-blue-700">
                          {message.sender_type === 'organization' ? 'You' : 'Whistleblower'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{message.encrypted_message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <Label htmlFor="newMessage">Send a secure message</Label>
                <Textarea
                  id="newMessage"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message to the whistleblower..."
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    Messages are encrypted end-to-end
                  </div>
                  <Button 
                    onClick={sendMessage} 
                    disabled={sending || !newMessage.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportViewModal;
