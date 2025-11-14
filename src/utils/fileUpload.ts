
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from './auditLogger';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

// File upload limits (PRIVACY FIX H4)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB per report
const MAX_FILES_PER_REPORT = 20;

// Allowed file types (PRIVACY FIX H1)
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  // Archives (ZIP only)
  'application/zip',
  'application/x-zip-compressed',
];

const ALLOWED_EXTENSIONS = [
  'pdf', 'docx', 'xlsx', 'pptx',
  'jpg', 'jpeg', 'png',
  'zip'
];

// Blacklisted dangerous file types
const BLACKLISTED_EXTENSIONS = [
  'exe', 'dll', 'com', 'app', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js',
  'rar', '7z', 'cab', 'iso', 'msi', 'scr', 'pif', 'jar', 'deb', 'rpm'
];

/**
 * Validate file type and size before upload
 */
const validateFile = (file: File, reportId: string): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please compress or split the file.`
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty. Please select a valid file.'
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return {
      valid: false,
      error: 'File must have an extension.'
    };
  }

  // Check blacklist
  if (BLACKLISTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not allowed for security reasons.`
    };
  }

  // Check whitelist
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not supported. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Check MIME type matches extension
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    // Warn but don't block - MIME types can be unreliable
    console.warn(`MIME type ${file.type} doesn't match allowed types, but extension is valid`);
  }

  return { valid: true };
};

/**
 * Hash original filename to prevent PII leakage
 * Uses SHA-256 with report_id as salt for uniqueness
 */
const hashFilename = async (originalFilename: string, reportId: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${originalFilename}:${reportId}:${Date.now()}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate sanitized display name from original filename
 * Removes PII patterns: dates, names, personal identifiers
 */
const sanitizeDisplayName = (originalFilename: string): string => {
  // Extract file extension
  const extension = originalFilename.split('.').pop() || '';
  const nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
  
  // Remove common PII patterns
  let sanitized = nameWithoutExt
    // Remove dates (YYYY-MM-DD, DD-MM-YYYY, etc.)
    .replace(/\d{4}[-_]\d{2}[-_]\d{2}/g, '')
    .replace(/\d{2}[-_]\d{2}[-_]\d{4}/g, '')
    // Remove years (4 digits)
    .replace(/\b\d{4}\b/g, '')
    // Remove common name patterns (Title Case words that might be names)
    .replace(/\b[A-Z][a-z]+[-_][A-Z][a-z]+\b/g, '')
    // Remove email-like patterns
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    // Remove multiple underscores/hyphens
    .replace(/[-_]{2,}/g, '_')
    // Trim whitespace
    .trim();
  
  // If sanitization removed everything, use generic name
  if (!sanitized || sanitized.length < 2) {
    sanitized = 'document';
  }
  
  // Limit length and add extension
  const maxLength = 50;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return `${sanitized}.${extension}`;
};

export const uploadReportFile = async (
  file: File,
  trackingId: string,
  reportId: string
): Promise<FileUploadResult> => {
  try {
    // Validate file before upload (PRIVACY FIX H1, H4)
    const validation = validateFile(file, reportId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check total file count and size for this report
    const { data: existingAttachments } = await supabase
      .from('report_attachments')
      .select('file_size')
      .eq('report_id', reportId);

    if (existingAttachments) {
      const fileCount = existingAttachments.length;
      if (fileCount >= MAX_FILES_PER_REPORT) {
        return {
          success: false,
          error: `Maximum of ${MAX_FILES_PER_REPORT} files per report. Please remove some files first.`
        };
      }

      const totalSize = existingAttachments.reduce((sum, att) => sum + (att.file_size || 0), 0);
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        return {
          success: false,
          error: `Total file size would exceed ${MAX_TOTAL_SIZE / (1024 * 1024)}MB. Please remove some files first.`
        };
      }
    }

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

    // Hash original filename to prevent PII leakage (PRIVACY FIX C1)
    const filenameHash = await hashFilename(file.name, reportId);
    const sanitizedDisplayName = sanitizeDisplayName(file.name);

    // Create attachment record in database
    // Store hashed filename instead of original to protect PII
    const { error: dbError } = await supabase
      .from('report_attachments')
      .insert({
        report_id: reportId,
        filename: fileName,
        original_filename: filenameHash, // Store hash instead of plaintext
        encrypted_file_url: publicUrl,
        content_type: file.type,
        file_size: file.size,
        uploaded_by_whistleblower: true,
        encryption_metadata: {
          upload_timestamp: new Date().toISOString(),
          file_hash: await generateFileHash(file),
          sanitized_display_name: sanitizedDisplayName, // Store sanitized name for display
          original_filename_hash: filenameHash // Store hash for reference
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
        // Use sanitized name in audit log to avoid PII leakage
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
          summary: `File "${sanitizedDisplayName}" uploaded to report ${report.tracking_id}`,
          description: `Attachment uploaded via secure file upload`,
          metadata: {
            filename_hash: filenameHash, // Store hash, not original name
            sanitized_filename: sanitizedDisplayName,
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

/**
 * Get display name for attachment
 * Uses sanitized name from metadata if available, otherwise falls back to generic name
 */
export const getAttachmentDisplayName = (attachment: {
  original_filename?: string | null;
  encryption_metadata?: any;
}): string => {
  // Check if we have sanitized display name in metadata (new format)
  if (attachment.encryption_metadata?.sanitized_display_name) {
    return attachment.encryption_metadata.sanitized_display_name;
  }
  
  // Fallback: if original_filename looks like a hash (64 char hex), use generic name
  if (attachment.original_filename && /^[a-f0-9]{64}$/i.test(attachment.original_filename)) {
    return 'document';
  }
  
  // Legacy: if original_filename exists and doesn't look like a hash, use it (backward compatibility)
  if (attachment.original_filename) {
    return attachment.original_filename;
  }
  
  return 'document';
};

export const downloadReportFile = async (
  fileName: string,
  attachmentId: string,
  reportId: string
): Promise<Blob | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('report-attachments')
      .download(fileName);

    if (error) {
      console.error('File download error:', error);
      return null;
    }

    // Log file download to audit trail (PRIVACY FIX H2)
    try {
      const { data: report } = await supabase
        .from('reports')
        .select('organization_id, tracking_id')
        .eq('id', reportId)
        .single();

      const { data: attachment } = await supabase
        .from('report_attachments')
        .select('encryption_metadata')
        .eq('id', attachmentId)
        .single();

      // Get current user for audit logging
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || 'unknown';

      if (report?.organization_id) {
        const displayName = attachment?.encryption_metadata?.sanitized_display_name || 'document';
        
        await auditLogger.log({
          eventType: 'report.attachment_downloaded',
          category: 'case_management',
          action: 'File attachment downloaded',
          severity: 'low',
          actorType: 'user',
          actorId: user?.id,
          actorEmail: userEmail,
          targetType: 'report',
          targetId: reportId,
          targetName: report.tracking_id,
          summary: `File "${displayName}" downloaded from report ${report.tracking_id}`,
          description: `Attachment downloaded via secure file download`,
          metadata: {
            attachment_id: attachmentId,
            filename: fileName,
            sanitized_filename: displayName,
          },
          organizationId: report.organization_id,
        });
      }
    } catch (auditError) {
      // Don't fail the download if audit logging fails
      console.error('Failed to log file download audit:', auditError);
    }

    return data;
  } catch (error) {
    console.error('Unexpected error during file download:', error);
    return null;
  }
};
