
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, File, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { stripMetadataFromFiles } from '@/utils/metadataStripper';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  disabled = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set());

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
      return false;
    }

    // Check file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return fileType === type;
    });

    if (!isValidType) {
      toast.error(`File type not supported for "${file.name}".`);
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles || disabled || isProcessing) return;

    const validFiles: File[] = [];
    const fileArray = Array.from(newFiles);

    for (const file of fileArray) {
      if (files.length + validFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed.`);
        break;
      }

      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setIsProcessing(true);

      try {
        // Strip metadata from files
        const results = await stripMetadataFromFiles(validFiles);

        const cleanFiles: File[] = [];
        const newProcessedFiles = new Set(processedFiles);

        results.forEach((result, index) => {
          if (result.success && result.file) {
            cleanFiles.push(result.file);

            if (result.stripped) {
              // Mark this file as having metadata stripped
              newProcessedFiles.add(result.file.name);

              toast.success(
                `🛡️ Metadata removed from ${validFiles[index].name}`,
                { description: 'Your identity is protected' }
              );
            }
          } else {
            // If stripping failed, use original file but warn user
            console.warn(`Failed to strip metadata from ${validFiles[index].name}`);
            cleanFiles.push(validFiles[index]);
          }
        });

        setProcessedFiles(newProcessedFiles);

        const updatedFiles = [...files, ...cleanFiles];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
      } catch (error) {
        console.error('Error processing files:', error);
        toast.error('Failed to process files. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  }, [files, maxFiles, acceptedTypes, disabled, isProcessing, processedFiles, onFilesChange]);

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardContent
          className="p-6 sm:p-8 text-center cursor-pointer min-h-[180px] flex flex-col items-center justify-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            <span className="font-medium text-blue-600">Tap to upload</span> or drag and drop
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Maximum {maxFiles} files, up to {maxSize}MB each
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supported: Images, PDF, Word documents, Text files
          </p>

          <div className="flex items-center justify-center gap-1 mt-3 text-xs sm:text-sm text-green-600 px-2">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Metadata automatically removed to protect your identity</span>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing files...</span>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attached Files:</h4>
          {files.map((file, index) => {
            const hasMetadataStripped = processedFiles.has(file.name);
            return (
              <div key={index} className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <File className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className="text-sm font-medium text-gray-900 break-words">{file.name}</p>
                      {hasMetadataStripped && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 border border-green-200 w-fit">
                          <Shield className="h-3 w-3" />
                          Protected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className="min-h-[40px] min-w-[40px] flex-shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">File Upload Security</p>
            <p>Files will be encrypted and stored securely. Only authorized organization members will be able to access your attachments.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
