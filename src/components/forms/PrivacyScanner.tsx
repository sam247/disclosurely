import { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, EyeOff, Sparkles } from 'lucide-react';
import {
  scanForPrivacyRisks,
  calculatePrivacyScore,
  autoRedactText,
  getPrivacyRiskSummary,
  PrivacyRisk
} from '@/utils/privacyDetection';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PrivacyScannerProps {
  title: string;
  description: string;
  onAutoRedact?: (redactedTitle: string, redactedDescription: string) => void;
  className?: string;
}

const PrivacyScanner = ({ title, description, onAutoRedact, className = '' }: PrivacyScannerProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Combine title and description for scanning
  const combinedText = `${title}\n\n${description}`;

  // Scan for privacy risks (memoized to avoid re-scanning on every render)
  const risks = useMemo(() => {
    return scanForPrivacyRisks(combinedText);
  }, [combinedText]);

  const privacyScore = useMemo(() => {
    return calculatePrivacyScore(risks);
  }, [risks]);

  const riskSummary = useMemo(() => {
    return getPrivacyRiskSummary(risks);
  }, [risks]);

  // Auto-expand if risks are found
  useEffect(() => {
    if (risks.length > 0) {
      setShowDetails(true);
    }
  }, [risks.length]);

  const handleAutoRedact = () => {
    const titleLength = title.length + 2; // +2 for the \n\n separator

    // Separate risks by whether they're in title or description
    const titleRisks = risks.filter(r => r.position.start < titleLength);
    const descriptionRisks = risks.filter(r => r.position.start >= titleLength).map(r => ({
      ...r,
      position: {
        start: r.position.start - titleLength,
        end: r.position.end - titleLength
      }
    }));

    const redactedTitle = autoRedactText(title, titleRisks);
    const redactedDescription = autoRedactText(description, descriptionRisks);

    if (onAutoRedact) {
      onAutoRedact(redactedTitle, redactedDescription);
    }
  };

  // Don't show anything if no risks and high privacy score
  if (risks.length === 0) {
    return (
      <div className={`p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 ${className}`}>
        <Shield className="w-4 h-4 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Privacy Protected</p>
          <p className="text-xs text-green-600">No identifying information detected</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
          Score: {privacyScore}%
        </Badge>
      </div>
    );
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-100 border-green-300';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    if (score >= 40) return 'text-orange-700 bg-orange-100 border-orange-300';
    return 'text-red-700 bg-red-100 border-red-300';
  };

  const highRisks = risks.filter(r => r.severity === 'high');
  const mediumRisks = risks.filter(r => r.severity === 'medium');
  const lowRisks = risks.filter(r => r.severity === 'low');

  return (
    <Collapsible open={showDetails} onOpenChange={setShowDetails} className={className}>
      <Alert variant="destructive" className="border-orange-300 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900 flex items-center justify-between">
          <span>Privacy Warning Detected</span>
          <Badge variant="outline" className={getScoreColor(privacyScore)}>
            Privacy Score: {privacyScore}%
          </Badge>
        </AlertTitle>
        <AlertDescription className="text-orange-800 space-y-3">
          <p className="text-sm">{riskSummary}</p>

          <div className="flex flex-wrap gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-orange-300 hover:bg-orange-100"
              >
                {showDetails ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                {showDetails ? 'Hide' : 'View'} Details
              </Button>
            </CollapsibleTrigger>

            {onAutoRedact && (
              <Button
                variant="default"
                size="sm"
                className="text-xs bg-orange-600 hover:bg-orange-700"
                onClick={handleAutoRedact}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Auto-Redact All
              </Button>
            )}
          </div>

          <CollapsibleContent className="space-y-3 mt-3">
            {highRisks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  High Risk ({highRisks.length})
                </p>
                {highRisks.map((risk, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-red-300">
                    <p className="text-xs font-mono bg-white px-2 py-1 rounded border border-red-200">
                      Found: <span className="text-red-600 font-semibold">{risk.text}</span>
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {risk.description}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Suggested redaction: <span className="font-semibold">{risk.redacted}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {mediumRisks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Medium Risk ({mediumRisks.length})
                </p>
                {mediumRisks.map((risk, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-orange-300">
                    <p className="text-xs font-mono bg-white px-2 py-1 rounded border border-orange-200">
                      Found: <span className="text-orange-600 font-semibold">{risk.text}</span>
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      {risk.description}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Suggested redaction: <span className="font-semibold">{risk.redacted}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {lowRisks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-yellow-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Low Risk ({lowRisks.length})
                </p>
                {lowRisks.map((risk, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-yellow-300">
                    <p className="text-xs font-mono bg-white px-2 py-1 rounded border border-yellow-200">
                      Found: <span className="text-yellow-700 font-semibold">{risk.text}</span>
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {risk.description}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Suggested redaction: <span className="font-semibold">{risk.redacted}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-orange-200">
              <p className="text-xs text-orange-700">
                <strong>Tip:</strong> Click "Auto-Redact All" to automatically replace all identifying information,
                or manually edit your report to remove these items.
              </p>
            </div>
          </CollapsibleContent>
        </AlertDescription>
      </Alert>
    </Collapsible>
  );
};

export default PrivacyScanner;
