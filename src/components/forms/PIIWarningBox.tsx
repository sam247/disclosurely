import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface PIIWarningBoxProps {
  detections: Array<{ type: string; text?: string }>;
  isDetecting?: boolean;
  className?: string;
}

export const PIIWarningBox = ({ detections, isDetecting = false, className = '' }: PIIWarningBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isDetecting) {
    return (
      <div className={`text-xs text-muted-foreground flex items-center gap-2 ${className}`}>
        <AlertTriangle className="h-3 w-3 animate-pulse" />
        Checking for personal information...
      </div>
    );
  }

  if (!detections || detections.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Alert variant="destructive" className="py-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <strong>⚠️ Personal Information Detected</strong>
              <p className="text-xs mt-1 text-muted-foreground">
                {detections.length} item{detections.length > 1 ? 's' : ''} detected. Click to view details.
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="mt-3 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              {detections.slice(0, 10).map((detection, i) => {
                // Format detection type for display using same labels as privacyDetection
                const typeLabels: Record<string, string> = {
                  email: 'email address',
                  phone: 'phone number',
                  employeeId: 'employee/office ID',
                  ssn: 'social security number',
                  creditCard: 'credit card number',
                  ipAddress: 'IP address',
                  url: 'URL',
                  possibleName: 'name',
                  standaloneName: 'possible name',
                  specificDate: 'specific date',
                  address: 'address'
                };
                
                const typeDisplay = typeLabels[detection.type] || detection.type.replace(/_/g, ' ');
                
                return (
                  <li key={i} className="text-xs">
                    <span className="font-medium capitalize">{typeDisplay}</span>
                    {detection.text && (
                      <span className="text-muted-foreground ml-1">
                        ({detection.text.substring(0, 30)}{detection.text.length > 30 ? '...' : ''})
                      </span>
                    )}
                    : Remove this to maintain anonymity
                  </li>
                );
              })}
              {detections.length > 10 && (
                <li className="text-xs text-muted-foreground">
                  ...and {detections.length - 10} more
                </li>
              )}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: Use general terms instead of specific names, emails, or phone numbers.
            </p>
          </CollapsibleContent>
        </AlertDescription>
      </Alert>
    </Collapsible>
  );
};

