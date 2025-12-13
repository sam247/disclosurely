import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface SaveDraftModalProps {
  draftCode: string;
  onClose: () => void;
  brandColor?: string;
}

export const SaveDraftModal = ({ draftCode, onClose, brandColor = '#2563eb' }: SaveDraftModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (draftCode) {
      navigator.clipboard.writeText(draftCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!draftCode) {
    console.error('SaveDraftModal: draftCode is empty or undefined');
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-xs w-full mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xs w-full mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Save This Code!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Your draft has been saved. Use this code to resume your report later:
          </p>

          <div className="bg-muted p-2.5 rounded-lg border-2" style={{ borderColor: `${brandColor}33` }}>
            <p className="text-center text-sm font-mono font-bold break-all px-1" style={{ color: brandColor }}>
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
      </DialogContent>
    </Dialog>
  );
};
