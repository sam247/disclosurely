import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { usePIIDetector } from '@/hooks/usePIIDetector';
import { PIIWarningBox } from '@/components/forms/PIIWarningBox';

interface Step7WhenWhereProps {
  incidentDate: string;
  location: string;
  onChange: (updates: { incidentDate?: string; location?: string }) => void;
  language: string;
  organizationId?: string;
}

const Step7WhenWhere = ({ incidentDate, location, onChange, language, organizationId }: Step7WhenWhereProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  
  // Real-time PII detection for location field
  const { hasPII: hasLocationPII, detections: locationDetections, isDetecting: isDetectingLocation, hasError: hasLocationError } = usePIIDetector(location, {
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
    if (!locationDetections || detectionIndex >= locationDetections.length) return;
    
    const detection = locationDetections[detectionIndex];
    if (!detection.position || !detection.text) return;
    
    const { start, end } = detection.position;
    const redactedText = getRedactedText(detection.text, detection.type);
    
    const newLocation = location.slice(0, start) + redactedText + location.slice(end);
    onChange({ location: newLocation });
  };

  // Handle redaction of all detections
  const handleRedactAll = () => {
    if (!locationDetections || locationDetections.length === 0) return;
    
    const sortedDetections = [...locationDetections]
      .filter(d => d.position && d.text)
      .sort((a, b) => (b.position?.end || 0) - (a.position?.end || 0));
    
    let newLocation = location;
    
    for (const detection of sortedDetections) {
      if (detection.position && detection.text) {
        const { start, end } = detection.position;
        const redactedText = getRedactedText(detection.text, detection.type);
        newLocation = newLocation.slice(0, start) + redactedText + newLocation.slice(end);
      }
    }
    
    onChange({ location: newLocation });
  };

  return (
    <div className="space-y-4 py-2 flex flex-col">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {t.step6.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.step6.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Label htmlFor="incidentDate" className="text-base">
              {t.step6.whenLabel}
            </Label>
          </div>
          <Input
            id="incidentDate"
            type="text"
            value={incidentDate}
            onChange={(e) => onChange({ incidentDate: e.target.value })}
            placeholder={t.step6.whenPlaceholder}
            className="min-h-[48px] text-base"
          />
          <p className="text-xs text-gray-500">
            {t.step6.whenHint}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Label htmlFor="location" className="text-base">
              {t.step6.whereLabel}
            </Label>
          </div>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder={t.step6.wherePlaceholder}
            className={`min-h-[48px] text-base ${
              hasLocationPII ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          <p className="text-xs text-gray-500">
            {t.step6.whereHint}
          </p>
          
          {/* PII detection feedback for location */}
          {location.length > 5 && (
            <div className="space-y-2">
              <PIIWarningBox 
                detections={locationDetections} 
                isDetecting={isDetectingLocation}
                onRedact={handleRedact}
                onRedactAll={handleRedactAll}
              />
              {!isDetectingLocation && !hasLocationPII && !hasLocationError && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  ✅ No personal information detected
                </div>
              )}
              {!isDetectingLocation && hasLocationError && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  ⚠️ Unable to check for personal information. Please review your content carefully.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(incidentDate || location) && (
        <p className="text-sm text-green-600 mt-2">
          {t.step6.contextProvided}
          {incidentDate && `: ${t.step6.occurred} ${incidentDate}`}
          {location && ` ${t.step6.at} ${location}`}
        </p>
      )}
    </div>
  );
};

export default Step7WhenWhere;
