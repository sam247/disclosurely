import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, Loader2 } from 'lucide-react';

interface Step3DescriptionProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

const Step3Description = ({ value, onChange, isValid }: Step3DescriptionProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Simulate AI analysis indicator when user has typed enough
  useEffect(() => {
    if (value.length > 50) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Tell us what happened
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Provide a detailed description of the incident
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base">
          Detailed Description *
        </Label>
        <Textarea
          ref={textareaRef}
          id="description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Please describe what happened in detail. Include relevant information like when it occurred, who was involved, and any other important context..."
          className="min-h-[200px] text-base resize-none"
          maxLength={5000}
        />
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-500">
            {!isValid && value.length > 0 && value.length < 20 && (
              <span className="text-amber-600">At least 20 characters required</span>
            )}
            {isValid && !isAnalyzing && (
              <span className="text-green-600">✓ Good detail level</span>
            )}
            {isAnalyzing && (
              <span className="text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" />
                AI is analyzing your report...
              </span>
            )}
          </div>
          <span className="text-gray-400">{value.length}/5000</span>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-purple-900">
              AI Privacy Protection & Categorization
            </p>
            <p className="text-sm text-purple-800">
              As you type, our AI will:
            </p>
            <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside ml-2">
              <li>Scan for information that could identify you</li>
              <li>Suggest the most appropriate category for your report</li>
              <li>Help protect your anonymity</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">💡 What to include:</p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>What</strong> happened - Describe the incident or concern</li>
          <li><strong>When</strong> it occurred - Approximate timeframe</li>
          <li><strong>Who</strong> was involved - Without revealing your identity</li>
          <li><strong>Where</strong> it took place - Department, location, or area</li>
          <li><strong>Impact</strong> - Why this is a concern</li>
        </ul>
      </div>
    </div>
  );
};

export default Step3Description;
