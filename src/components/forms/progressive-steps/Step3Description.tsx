import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Tell us what happened
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Provide a detailed description of the incident
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="description" className="text-base">
              Detailed Description *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-2">What to include:</p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li><strong>What</strong> happened - Describe the incident</li>
                  <li><strong>When</strong> it occurred - Approximate timeframe</li>
                  <li><strong>Who</strong> was involved - Without revealing your identity</li>
                  <li><strong>Where</strong> it took place - Department or area</li>
                  <li><strong>Impact</strong> - Why this is a concern</li>
                </ul>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Sparkles className="h-4 w-4 text-purple-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-2">AI Privacy Protection</p>
                <p className="text-sm mb-2">As you type, our AI will:</p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>Scan for information that could identify you</li>
                  <li>Suggest the most appropriate category</li>
                  <li>Help protect your anonymity</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            ref={textareaRef}
            id="description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Please describe what happened in detail. Include relevant information like when it occurred, who was involved, and any other important context..."
            className="min-h-[180px] text-base resize-none"
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
      </div>
    </TooltipProvider>
  );
};

export default Step3Description;
