import { Label } from '@/components/ui/label';
import { Paperclip, Shield, FileText, Image, FileAudio, FileVideo } from 'lucide-react';
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
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Paperclip className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t.step7.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t.step7.subtitle}
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-900">
              {t.step7.metadataTitle}
            </p>
            <p className="text-sm text-green-800">
              {t.step7.metadataDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base">{t.step7.uploadLabel}</Label>
        <FileUpload
          onFilesSelected={setAttachedFiles}
          maxFiles={10}
          maxSizeMB={50}
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

      <div className="grid md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <p className="text-sm font-medium text-gray-900">{t.step7.fileTypes.documents.title}</p>
          <p className="text-xs text-gray-600 mt-1">{t.step7.fileTypes.documents.desc}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Image className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <p className="text-sm font-medium text-gray-900">{t.step7.fileTypes.images.title}</p>
          <p className="text-xs text-gray-600 mt-1">{t.step7.fileTypes.images.desc}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <FileAudio className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <p className="text-sm font-medium text-gray-900">{t.step7.fileTypes.audioVideo.title}</p>
          <p className="text-xs text-gray-600 mt-1">{t.step7.fileTypes.audioVideo.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default Step8Evidence;
