import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { useIsMobile } from '@/hooks/use-mobile';

interface SaveDraftModalProps {
  draftCode: string;
  onClose: () => void;
  brandColor?: string;
  currentStep?: number;
  language?: string;
}

export const SaveDraftModal = ({ 
  draftCode, 
  onClose, 
  brandColor = '#2563eb',
  currentStep = 0,
  language = 'en'
}: SaveDraftModalProps) => {
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  
  // Calculate progress (assuming 10 total steps, same as form)
  const totalSteps = 10;
  const displayStep = currentStep === 0 ? 0 : currentStep;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const handleCopy = () => {
    if (draftCode) {
      navigator.clipboard.writeText(draftCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const modalContent = (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Your draft has been saved. Use this code to resume your report later:
      </p>

      <div className="bg-muted p-3 rounded-lg border-2" style={{ borderColor: `${brandColor}33` }}>
        <p className="text-center text-lg font-mono font-bold break-all" style={{ color: brandColor }}>
          {draftCode}
        </p>
      </div>

      <Button
        onClick={handleCopy}
        variant="outline"
        className="w-full gap-2"
        size="sm"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            Copy Code
          </>
        )}
      </Button>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
        <p className="text-xs text-amber-800">
          <strong>⚠️ Important:</strong> Drafts expire after 48 hours. Make sure to save this code in a secure location.
        </p>
      </div>

      <Button 
        onClick={onClose} 
        className="w-full" 
        size="sm"
        style={{ backgroundColor: brandColor }}
      >
        Continue Editing
      </Button>
    </div>
  );

  if (!draftCode) {
    console.error('SaveDraftModal: draftCode is empty or undefined');
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Error Saving Draft
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-red-600">
              The draft was saved but no draft code was received. Please try saving again.
            </p>
            <Button onClick={onClose} className="w-full" size="sm" style={{ backgroundColor: brandColor }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Use Drawer (bottom sheet) on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={true} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          {/* Progress bar and step info - matching form style */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">
                {currentStep === 0
                  ? t.navigation.welcome
                  : t.navigation.step
                      .replace('{current}', displayStep.toString())
                      .replace('{total}', '9')}
              </span>
              <span className="text-xs text-gray-500">{Math.round(progressPercent)}{t.navigation.percent}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          
          <DrawerHeader className="text-left px-4 pb-2">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Save This Code!
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 pb-4 overflow-y-auto">
            {modalContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Dialog
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Save This Code!
          </DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};
