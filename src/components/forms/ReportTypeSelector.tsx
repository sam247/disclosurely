
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
      <div className="flex items-center space-x-3">
        <Switch
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
        />
        <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm">
          {isAnonymous ? 'Anonymous Submission' : 'Confidential Submission'}
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
          />
        </div>
      )}
    </div>
  );
};

export default ReportTypeSelector;
