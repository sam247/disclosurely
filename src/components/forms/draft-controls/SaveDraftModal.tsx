import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface SaveDraftModalProps {
  draftCode: string;
  onClose: () => void;
}

export const SaveDraftModal = ({ draftCode, onClose }: SaveDraftModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(draftCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Save This Code!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your draft has been saved. Use this code to resume your report later:
          </p>

          <div className="bg-muted p-4 rounded-lg border-2 border-primary/20">
            <p className="text-center text-2xl font-mono font-bold text-primary break-all">
              {draftCode}
            </p>
          </div>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </Button>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>⚠️ Important:</strong> Drafts expire after 48 hours. Make sure to save this code in a secure location.
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Continue Editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
