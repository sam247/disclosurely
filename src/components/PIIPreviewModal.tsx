import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, Info, Lock } from 'lucide-react';
import { detectPII, highlightPIIForDisplay, formatPIIType } from '@/utils/pii-detector-client';

interface PIIPreviewModalProps {
  originalText: string;
  caseTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PIIPreviewModal: React.FC<PIIPreviewModalProps> = ({
  originalText,
  caseTitle,
  onConfirm,
  onCancel
}) => {
  // Detect PII client-side
  const redactionResult = detectPII(originalText);
  const highlightedParts = highlightPIIForDisplay(originalText, redactionResult.detections);

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-green-600" />
            Privacy Preview: {caseTitle}
          </DialogTitle>
          <DialogDescription className="text-base">
            {redactionResult.piiCount > 0 
              ? `${redactionResult.piiCount} piece${redactionResult.piiCount > 1 ? 's' : ''} of personal information will be automatically redacted before AI analysis.`
              : 'No personal information detected. Your case will be analyzed as-is.'}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original with highlights */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-red-50 border-b p-3 sticky top-0">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  Your Input (Contains PII)
                </h3>
              </div>
              <div className="p-4 bg-white text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {highlightedParts.map((part, idx) => (
                  part.isPII ? (
                    <span
                      key={idx}
                      className="bg-yellow-200 border-b-2 border-yellow-500 font-semibold px-1 cursor-help"
                      title={`${formatPIIType(part.type!)} - Will be redacted as ${part.placeholder}`}
                    >
                      {part.text}
                    </span>
                  ) : (
                    <span key={idx}>{part.text}</span>
                  )
                ))}
              </div>
            </div>

            {/* Redacted version */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-green-50 border-b p-3 sticky top-0">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <EyeOff className="h-4 w-4" />
                  AI Will See (Protected)
                </h3>
              </div>
              <div className="p-4 bg-white text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {redactionResult.redactedText}
              </div>
            </div>
          </div>

          {/* PII breakdown */}
          {redactionResult.piiCount > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-50 border-b p-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4" />
                  Protected Information ({redactionResult.piiCount} items)
                </h3>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  {redactionResult.detections.map((detection, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border"
                    >
                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-mono font-semibold rounded">
                          {detection.placeholder}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm min-w-0">
                        <span className="text-gray-400">→</span>
                        <span className="font-mono text-red-600 truncate" title={detection.original}>
                          {detection.original}
                        </span>
                      </div>
                      <div className="flex-shrink-0 ml-auto">
                        <span className="text-xs text-gray-500">
                          {formatPIIType(detection.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 space-y-2">
                <p className="font-semibold">How Privacy Protection Works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 ml-2">
                  <li>Personal information is <strong>automatically detected</strong> and redacted before AI analysis</li>
                  <li>The AI provider (DeepSeek) will <strong>NEVER see</strong> your emails, phone numbers, or other PII</li>
                  <li>Original data is <strong>encrypted and stored securely</strong> in your Supabase database</li>
                  <li>Redaction mapping is stored for <strong>24 hours</strong> then permanently deleted</li>
                  <li>Zero data retention with AI provider - <strong>no model training</strong> on your data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onCancel}>
            Go Back
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            <Shield className="h-4 w-4 mr-2" />
            Looks Good - Proceed with Analysis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

