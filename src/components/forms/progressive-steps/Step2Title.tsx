import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
    <div className="space-y-6 py-4">
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
        <Label htmlFor="title" className="text-base">
          Report Title *
        </Label>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">💡 Examples of good titles:</p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>"Unethical hiring practices in HR department"</li>
          <li>"Safety equipment not provided on construction site"</li>
          <li>"Financial irregularities in expense reports"</li>
        </ul>
      </div>
    </div>
  );
};

export default Step2Title;
