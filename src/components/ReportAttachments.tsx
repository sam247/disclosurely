
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, File, Eye, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadReportFile } from '@/utils/fileUpload';

interface ReportAttachment {
  id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  created_at: string;
  uploaded_by_whistleblower: boolean;
}

interface ReportAttachmentsProps {
  reportId: string;
}

const ReportAttachments: React.FC<ReportAttachmentsProps> = ({ reportId }) => {
  const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchAttachments();
  }, [reportId]);

  const fetchAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('report_attachments')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attachments:', error);
        toast.error('Failed to load attachments');
        return;
      }

      setAttachments(data || []);
    } catch (error) {
      console.error('Unexpected error fetching attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment: ReportAttachment) => {
    setDownloading(attachment.id);
    
    try {
      const fileBlob = await downloadReportFile(attachment.filename);
      
      if (!fileBlob) {
        toast.error('Failed to download file');
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.original_filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Eye className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Paperclip className="h-5 w-5" />
            <span>Attachments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading attachments...</p>
        </CardContent>
      </Card>
    );
  }

  if (attachments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Paperclip className="h-5 w-5" />
            <span>Attachments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No attachments found for this report.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Paperclip className="h-5 w-5" />
          <span>Attachments ({attachments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {getFileIcon(attachment.content_type)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {attachment.original_filename}
                  </p>
                  <p className="text-xs text-gray-500 break-words">
                    {formatFileSize(attachment.file_size)} • {formatDate(attachment.created_at)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(attachment)}
                disabled={downloading === attachment.id}
                className="shrink-0 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading === attachment.id ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportAttachments;
