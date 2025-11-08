import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, HelpCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Step2TitleProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

const Step2Title = ({ value, onChange, isValid }: Step2TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Give your report a title
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              A brief, clear summary of the issue
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="title" className="text-base">
              Report Title *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-2">Examples of good titles:</p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>"Unethical hiring practices in HR department"</li>
                  <li>"Safety equipment not provided on construction site"</li>
                  <li>"Financial irregularities in expense reports"</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            ref={inputRef}
            id="title"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Unsafe working conditions in warehouse"
            className="text-lg min-h-[56px] text-base"
            maxLength={200}
            autoComplete="off"
          />
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-500">
              {!isValid && value.length > 0 && value.length < 5 && (
                <span className="text-amber-600">At least 5 characters required</span>
              )}
              {isValid && (
                <span className="text-green-600">✓ Looks good</span>
              )}
            </div>
            <span className="text-gray-400">{value.length}/200</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Step2Title;
