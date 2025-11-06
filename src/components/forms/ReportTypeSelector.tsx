
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface ReportTypeSelectorProps {
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
  submitterEmail: string;
  setSubmitterEmail: (value: string) => void;
}

const ReportTypeSelector = ({
  isAnonymous,
  setIsAnonymous,
  submitterEmail,
  setSubmitterEmail
}: ReportTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Report Type</Label>
      <div className="flex items-start sm:items-center space-x-3 min-h-[44px]">
        <Switch
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          className="mt-1 sm:mt-0"
        />
        <Label htmlFor="anonymous" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm cursor-pointer">
          <span className="font-medium">{isAnonymous ? 'Anonymous Submission' : 'Confidential Submission'}</span>
          <span className="text-xs text-gray-500">
            ({isAnonymous ? 'No personal information required' : 'Provide email for follow-up'})
          </span>
        </Label>
      </div>

      {!isAnonymous && (
        <div className="space-y-2">
          <Label htmlFor="submitter_email">Email Address</Label>
          <Input
            id="submitter_email"
            type="email"
            value={submitterEmail}
            onChange={(e) => setSubmitterEmail(e.target.value)}
            placeholder="your@email.com"
            required={!isAnonymous}
            autoComplete="email"
            inputMode="email"
            className="min-h-[44px] text-base"
          />
        </div>
      )}
    </div>
  );
};

export default ReportTypeSelector;
