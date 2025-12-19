import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, History, CheckCircle2, AlertTriangle } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { usePIIDetector } from '@/hooks/usePIIDetector';
import { PIIWarningBox } from '@/components/forms/PIIWarningBox';

interface Step9AdditionalProps {
  witnesses: string;
  previousReports: boolean;
  onChange: (updates: { witnesses?: string; previousReports?: boolean }) => void;
  language: string;
  organizationId?: string;
}

const Step9Additional = ({ witnesses, previousReports, onChange, language, organizationId }: Step9AdditionalProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  
  // Real-time PII detection for witnesses field
  const { hasPII: hasWitnessesPII, detections: witnessesDetections, isDetecting: isDetectingWitnesses, hasError: hasWitnessesError } = usePIIDetector(witnesses, {
    debounce: 500,
    organizationId,
    confidenceThreshold: 0.4,
  });

  // Generate redacted text based on detection type
  const getRedactedText = (text: string, type: string): string => {
    const lowerType = type.toLowerCase();
    
    if (lowerType === 'email' || lowerType.includes('email')) {
      const [name, domain] = text.split('@');
      return `${name.slice(0, 1)}****@${domain || '[REDACTED]'}`;
    }
    
    if (lowerType === 'phone' || lowerType.includes('phone')) {
      return '***-***-' + text.slice(-4);
    }
    
    if (lowerType === 'ipaddress' || lowerType.includes('ip')) {
      return '***.***.***.***';
    }
    
    if (lowerType.includes('name') || lowerType === 'person') {
      return '[NAME REDACTED]';
    }
    
    if (lowerType === 'ssn' || lowerType.includes('ssn')) {
      return '***-**-****';
    }
    
    if (text.length > 2) {
      return text[0] + '****' + text[text.length - 1];
    }
    
    return '[REDACTED]';
  };

  // Handle redaction of a single detection
  const handleRedact = (detectionIndex: number) => {
    if (!witnessesDetections || detectionIndex >= witnessesDetections.length) return;
    
    const detection = witnessesDetections[detectionIndex];
    if (!detection.position || !detection.text) return;
    
    const { start, end } = detection.position;
    const redactedText = getRedactedText(detection.text, detection.type);
    
    const newWitnesses = witnesses.slice(0, start) + redactedText + witnesses.slice(end);
    onChange({ witnesses: newWitnesses });
  };

  // Handle redaction of all detections
  const handleRedactAll = () => {
    if (!witnessesDetections || witnessesDetections.length === 0) return;
    
    const sortedDetections = [...witnessesDetections]
      .filter(d => d.position && d.text)
      .sort((a, b) => (b.position?.end || 0) - (a.position?.end || 0));
    
    let newWitnesses = witnesses;
    
    for (const detection of sortedDetections) {
      if (detection.position && detection.text) {
        const { start, end } = detection.position;
        const redactedText = getRedactedText(detection.text, detection.type);
        newWitnesses = newWitnesses.slice(0, start) + redactedText + newWitnesses.slice(end);
      }
    }
    
    onChange({ witnesses: newWitnesses });
  };

  return (
    <div className="space-y-4 py-2 flex flex-col">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {t.step8.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.step8.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Witnesses */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <Label htmlFor="witnesses" className="text-base">
              {t.step8.witnessesLabel}
            </Label>
          </div>
          <Input
            id="witnesses"
            value={witnesses}
            onChange={(e) => onChange({ witnesses: e.target.value })}
            placeholder={t.step8.witnessesPlaceholder}
            className={`min-h-[48px] text-base ${
              hasWitnessesPII ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
            maxLength={200}
          />
          <p className="text-xs text-gray-500">
            {t.step8.witnessesHint}
          </p>
          
          {/* PII detection feedback for witnesses */}
          {witnesses.length > 5 && (
            <div className="space-y-2">
              <PIIWarningBox 
                detections={witnessesDetections} 
                isDetecting={isDetectingWitnesses}
                onRedact={handleRedact}
                onRedactAll={handleRedactAll}
              />
              {!isDetectingWitnesses && !hasWitnessesPII && !hasWitnessesError && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  ✅ No personal information detected
                </div>
              )}
              {!isDetectingWitnesses && hasWitnessesError && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  ⚠️ Unable to check for personal information. Please review your content carefully.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Previous Reports */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            <Label htmlFor="previousReports" className="text-base">
              {t.step8.previousReportsLabel}
            </Label>
          </div>
          <Select
            value={previousReports ? "yes" : "no"}
            onValueChange={(value) => onChange({ previousReports: value === "yes" })}
          >
            <SelectTrigger className="min-h-[48px] text-base">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no" className="text-base">{t.step8.previousReportsNo}</SelectItem>
              <SelectItem value="yes" className="text-base">{t.step8.previousReportsYes}</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {(witnesses || previousReports) && (
        <p className="text-sm text-green-600 mt-2">
          {t.step8.contextProvided}
        </p>
      )}
    </div>
  );
};

export default Step9Additional;
