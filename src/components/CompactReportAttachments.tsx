import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, File, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadReportFile, getAttachmentDisplayName } from '@/utils/fileUpload';

interface ReportAttachment {
  id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  created_at: string;
  uploaded_by_whistleblower: boolean;
}

interface CompactReportAttachmentsProps {
  reportId: string;
}

const CompactReportAttachments: React.FC<CompactReportAttachmentsProps> = ({ reportId }) => {
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
        return;
      }

      setAttachments(data || []);
    } catch (error) {
      console.error('Unexpected error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment: ReportAttachment) => {
    setDownloading(attachment.id);
    
    try {
      const fileBlob = await downloadReportFile(attachment.filename, attachment.id, reportId);
      
      if (!fileBlob) {
        toast.error('Failed to download file');
        return;
      }

      // Create download link with sanitized display name
      const displayName = getAttachmentDisplayName(attachment);
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = displayName || 'download';
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

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Eye className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Loading attachments...</div>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900 text-sm">Attachments ({attachments.length})</h4>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <Button
            key={attachment.id}
            variant="outline"
            size="sm"
            onClick={() => handleDownload(attachment)}
            disabled={downloading === attachment.id}
            className="flex items-center space-x-2 h-8 px-3"
          >
            {getFileIcon(attachment.content_type)}
            <span className="text-xs max-w-32 truncate">
              {getAttachmentDisplayName(attachment)}
            </span>
            <span className="text-xs text-gray-500">
              ({formatFileSize(attachment.file_size)})
            </span>
            {downloading === attachment.id && (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CompactReportAttachments;