
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from './auditLogger';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export const uploadReportFile = async (
  file: File,
  trackingId: string,
  reportId: string
): Promise<FileUploadResult> => {
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${trackingId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('report-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get the public URL (even though bucket is private, we store the path)
    const { data: { publicUrl } } = supabase.storage
      .from('report-attachments')
      .getPublicUrl(fileName);

    // Create attachment record in database with simplified approach
    const { error: dbError } = await supabase
      .from('report_attachments')
      .insert({
        report_id: reportId,
        filename: fileName,
        original_filename: file.name,
        encrypted_file_url: publicUrl,
        content_type: file.type,
        file_size: file.size,
        uploaded_by_whistleblower: true,
        encryption_metadata: {
          upload_timestamp: new Date().toISOString(),
          file_hash: await generateFileHash(file)
        }
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('report-attachments')
        .remove([fileName]);
      return { success: false, error: dbError.message };
    }

    // Log file upload to audit trail
    try {
      const { data: report } = await supabase
        .from('reports')
        .select('organization_id, tracking_id')
        .eq('id', reportId)
        .single();

      if (report?.organization_id) {
        await auditLogger.log({
          eventType: 'report.attachment_uploaded',
          category: 'case_management',
          action: 'File attachment uploaded',
          severity: 'low',
          actorType: 'user',
          actorEmail: 'whistleblower',
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `File "${file.name}" uploaded to report ${report.tracking_id}`,
          description: `Attachment uploaded via secure file upload`,
          metadata: {
            filename: file.name,
            file_size: file.size,
            content_type: file.type,
            file_extension: fileExtension,
            uploaded_by_whistleblower: true,
          },
          organizationId: report.organization_id,
        });
      }
    } catch (auditError) {
      // Don't fail the upload if audit logging fails
      console.error('Failed to log file upload audit:', auditError);
    }

    return { success: true, fileUrl: publicUrl };
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return { success: false, error: 'An unexpected error occurred during file upload.' };
  }
};

// Generate a simple hash for file integrity checking
const generateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const downloadReportFile = async (fileName: string): Promise<Blob | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('report-attachments')
      .download(fileName);

    if (error) {
      console.error('File download error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error during file download:', error);
    return null;
  }
};
