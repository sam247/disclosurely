import { Label } from '@/components/ui/label';
import { Paperclip, FileText, Image, FileAudio, FileVideo } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

interface Step8EvidenceProps {
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
  language: string;
}

const Step8Evidence = ({ attachedFiles, setAttachedFiles, language }: Step8EvidenceProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {t.step7.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.step7.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base">{t.step7.uploadLabel}</Label>
        <FileUpload
          onFilesChange={setAttachedFiles}
          maxFiles={10}
          maxSize={50}
        />
      </div>

      {attachedFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-3">
            {t.step7.filesAttached
              .replace('{count}', attachedFiles.length.toString())
              .replace('{plural}', attachedFiles.length > 1 ? 's' : '')}:
          </p>
          <ul className="space-y-2">
            {attachedFiles.map((file, index) => {
              const getFileIcon = () => {
                if (file.type.startsWith('image/')) return Image;
                if (file.type.startsWith('audio/')) return FileAudio;
                if (file.type.startsWith('video/')) return FileVideo;
                return FileText;
              };
              const FileIcon = getFileIcon();
              const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

              return (
                <li key={index} className="flex items-center gap-2 text-sm text-blue-800">
                  <FileIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-blue-600">({fileSizeMB} MB)</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Step8Evidence;
