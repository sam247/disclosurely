import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Sparkles } from 'lucide-react';
import { PrivacyRisk } from '@/utils/privacyDetection';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

interface Step4PrivacyCheckProps {
  title: string;
  description: string;
  risks: PrivacyRisk[];
  onAutoRedact: (redactedTitle: string, redactedDescription: string) => void;
  language: string;
}

const Step4PrivacyCheck = ({ title, description, risks, onAutoRedact, language }: Step4PrivacyCheckProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  const handleAutoRedact = () => {
    let redactedTitle = title;
    let redactedDescription = description;

    // Sort risks by position (descending) to avoid position shifts
    const sortedRisks = [...risks].sort((a, b) => b.position.start - a.position.start);

    sortedRisks.forEach(risk => {
      const combinedText = `${title}\n\n${description}`;
      const before = combinedText.substring(0, risk.position.start);
      const after = combinedText.substring(risk.position.end);
      const redacted = before + risk.redacted + after;

      // Split back into title and description
      const parts = redacted.split('\n\n');
      redactedTitle = parts[0] || title;
      redactedDescription = parts.slice(1).join('\n\n') || description;
    });

    onAutoRedact(redactedTitle, redactedDescription);
  };

  const highRisks = risks.filter(r => r.severity === 'high');
  const mediumRisks = risks.filter(r => r.severity === 'medium');
  const lowRisks = risks.filter(r => r.severity === 'low');

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t.step3.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t.step3.subtitle}
          </p>
        </div>
      </div>

      <Alert variant="destructive" className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg">{t.step3.alertTitle}</AlertTitle>
        <AlertDescription className="mt-2">
          {t.step3.alertDesc
            .replace('{count}', risks.length.toString())
            .replace('{plural}', risks.length > 1 ? 's' : '')}
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">{t.step3.detectedInfo}</h3>

        {highRisks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{t.step3.highRisk}</Badge>
              <span className="text-sm text-gray-600">{highRisks.length} {t.step3.items}</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              {highRisks.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-red-600 font-mono text-sm">•</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{risk.description}</p>
                    <p className="text-sm text-red-700 font-mono bg-red-100 px-2 py-1 rounded mt-1 inline-block">
                      "{risk.text}"
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {t.step3.willBeReplaced} <span className="font-mono bg-white px-1 rounded">{risk.redacted}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mediumRisks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">{t.step3.mediumRisk}</Badge>
              <span className="text-sm text-gray-600">{mediumRisks.length} {t.step3.items}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              {mediumRisks.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 font-mono text-sm">•</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">{risk.description}</p>
                    <p className="text-sm text-amber-700 font-mono bg-amber-100 px-2 py-1 rounded mt-1 inline-block">
                      "{risk.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowRisks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">{t.step3.lowRisk}</Badge>
              <span className="text-sm text-gray-600">{lowRisks.length} {t.step3.items}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              {lowRisks.slice(0, 3).map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-mono text-sm">•</span>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">{risk.description}</p>
                  </div>
                </div>
              ))}
              {lowRisks.length > 3 && (
                <p className="text-xs text-blue-600">+ {lowRisks.length - 3} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-3 flex-1">
            <div>
              <p className="text-sm font-medium text-green-900">{t.step3.recommendedAction}</p>
              <p className="text-sm text-green-800 mt-1">
                {t.step3.recommendedDesc}
              </p>
            </div>
            <Button
              onClick={handleAutoRedact}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t.step3.autoRedactButton}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center text-sm text-gray-500">
        <p>{t.step3.continueWithout}</p>
      </div>
    </div>
  );
};

export default Step4PrivacyCheck;
