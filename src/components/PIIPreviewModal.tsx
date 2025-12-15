import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Info, Lock, AlertCircle } from 'lucide-react';
import { detectPIISync, highlightPIIForDisplay, formatPIIType } from '@/utils/pii-detector-client';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

interface PIIPreviewModalProps {
  originalText: string;
  caseTitle: string;
  onConfirm: () => void;
  onProceedWithoutRedaction?: () => void;
  onCancel: () => void;
}

export const PIIPreviewModal: React.FC<PIIPreviewModalProps> = ({
  originalText,
  caseTitle,
  onConfirm,
  onProceedWithoutRedaction,
  onCancel
}) => {
  const { toast } = useToast();
  const { organization } = useOrganization();
  const [reportingFalsePositive, setReportingFalsePositive] = useState<string | null>(null);
  const [redactionResult, setRedactionResult] = useState<{
    redactedText: string;
    detections: Array<{ original: string; placeholder: string; type: string; start: number; end: number }>;
    piiCount: number;
    stats: Record<string, number>;
  } | null>(null);
  const [highlightedParts, setHighlightedParts] = useState<Array<{ text: string; isPII: boolean; type?: string; placeholder?: string }>>([]);
  
  // Detect PII using client-side detection (same as anonymous report form)
  useEffect(() => {
    if (!originalText) {
      setRedactionResult({
        redactedText: '',
        detections: [],
        piiCount: 0,
        stats: {}
      });
      setHighlightedParts([{ text: '', isPII: false }]);
      return;
    }

    try {
      // Use the same client-side detection that works in the anonymous report
      const result = detectPIISync(originalText);
      
      setRedactionResult({
        redactedText: result.redactedText || originalText,
        detections: result.detections || [],
        piiCount: result.piiCount || 0,
        stats: result.stats || {}
      });
      
      // Generate highlighted parts for display
      const highlighted = highlightPIIForDisplay(
        originalText, 
        result.detections || []
      );
      setHighlightedParts(Array.isArray(highlighted) ? highlighted : [{ text: originalText, isPII: false }]);
    } catch (error) {
      console.error('Error detecting PII:', error);
      setRedactionResult({
        redactedText: originalText,
        detections: [],
        piiCount: 0,
        stats: {}
      });
      setHighlightedParts([{ text: originalText, isPII: false }]);
    }
  }, [originalText]);

  const handleReportFalsePositive = async (detection: any) => {
    if (!organization?.id) {
      toast({
        title: 'Error',
        description: 'Unable to report false positive. Organization not found.',
        variant: 'destructive'
      });
      return;
    }

    setReportingFalsePositive(detection.original);
    
    try {
      // Get context around the detection
      const start = Math.max(0, originalText.indexOf(detection.original) - 50);
      const end = Math.min(originalText.length, originalText.indexOf(detection.original) + detection.original.length + 50);
      const context = originalText.substring(start, end);

      const { error } = await supabase
        .from('pii_false_positives')
        .insert({
          organization_id: organization.id,
          detected_text: detection.original,
          detection_type: detection.type,
          context: context,
          reported_by: (await supabase.auth.getUser()).data.user?.id || null
        });

      if (error) throw error;

      toast({
        title: 'False Positive Reported',
        description: `"${detection.original}" has been reported. Thank you for helping improve our detection system!`,
      });

      setReportingFalsePositive(null);
    } catch (error: any) {
      console.error('Error reporting false positive:', error);
      toast({
        title: 'Error',
        description: 'Failed to report false positive. Please try again.',
        variant: 'destructive'
      });
      setReportingFalsePositive(null);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-green-600" />
            Privacy Preview: {caseTitle}
          </DialogTitle>
          <DialogDescription className="text-base">
            {(redactionResult?.piiCount || 0) > 0 
              ? `${redactionResult.piiCount} piece${redactionResult.piiCount > 1 ? 's' : ''} of personal information will be automatically redacted before AI analysis.`
              : 'No personal information detected. Your case will be analyzed as-is.'}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Redacted version only */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-50 border-b p-3 sticky top-0">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4" />
                AI Will See (Protected)
              </h3>
            </div>
            <div className="p-4 bg-white text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {redactionResult?.redactedText || originalText || ''}
            </div>
          </div>

          {/* PII breakdown */}
          {(redactionResult?.piiCount || 0) > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-50 border-b p-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4" />
                  Protected Information ({redactionResult.piiCount} items)
                </h3>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  {Array.isArray(redactionResult.detections) && redactionResult.detections.map((detection, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border"
                    >
                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-mono font-semibold rounded">
                          {detection.placeholder}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                        <span className="text-gray-400">→</span>
                        <span className="font-mono text-red-600 truncate" title={detection.original}>
                          {detection.original}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {formatPIIType(detection.type)}
                        </span>
                        {detection.type === 'standaloneName' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleReportFalsePositive(detection)}
                            disabled={reportingFalsePositive === detection.original}
                            title="Report as false positive (not a real name)"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {reportingFalsePositive === detection.original ? 'Reporting...' : 'Not a name'}
                          </Button>
                        )}
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

        <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Go Back
          </Button>
          {onProceedWithoutRedaction && (
            <Button 
              variant="outline" 
              onClick={onProceedWithoutRedaction}
              className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Proceed Without Redaction
            </Button>
          )}
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            Looks Good - Proceed with Analysis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

