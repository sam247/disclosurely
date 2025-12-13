import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PrivacyScanner from './PrivacyScanner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MAIN_CATEGORIES = {
  "Financial Misconduct": [
    "Fraud",
    "Bribery", 
    "Corruption",
    "Embezzlement",
    "Theft",
    "Kickbacks",
    "Laundering",
    "Insider",
    "Forgery",
    "Collusion"
  ],
  "Workplace Behaviour": [
    "Harassment",
    "Discrimination",
    "Bullying",
    "Retaliation", 
    "Nepotism",
    "Favouritism",
    "Misconduct",
    "Exploitation",
    "Abuse"
  ],
  "Legal & Compliance": [
    "Compliance",
    "Ethics",
    "Manipulation",
    "Extortion",
    "Coercion",
    "Violation"
  ],
  "Safety & Risk": [
    "Safety",
    "Negligence",
    "Hazards",
    "Sabotage"
  ],
  "Data & Security": [
    "Privacy",
    "Data",
    "Security",
    "Cyber"
  ]
};

interface FormData {
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  customCategory: string;
  priority: number;
}

interface ReportDetailsFormProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  validationErrors?: Record<string, string>;
}

const ReportDetailsForm = ({ formData, updateFormData, validationErrors = {} }: ReportDetailsFormProps) => {
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [hasAttemptedSuggestion, setHasAttemptedSuggestion] = useState(false);

  const handleMainCategoryChange = (value: string) => {
    updateFormData({
      mainCategory: value,
      subCategory: '', // Reset subcategory when main category changes
      customCategory: ''
    });
    // Clear AI suggestion flag when manually changed
    setAiSuggested(false);
  };

  const handleSubCategoryChange = (value: string) => {
    updateFormData({
      subCategory: value,
      customCategory: value === "Other (Please Specify)" ? formData.customCategory : ""
    });
    // Clear AI suggestion flag when manually changed
    setAiSuggested(false);
  };

  const availableSubCategories = formData.mainCategory ? MAIN_CATEGORIES[formData.mainCategory as keyof typeof MAIN_CATEGORIES] || [] : [];

  const suggestCategory = useCallback(async () => {
    // Only suggest if we have both title and description, haven't already suggested, and categories aren't already set
    if (!formData.title.trim() || !formData.description.trim() || hasAttemptedSuggestion) {
      
      return;
    }

    // Don't override if user has already selected categories
    if (formData.mainCategory && formData.subCategory) {
      
      return;
    }

    
    setIsLoadingSuggestion(true);
    setHasAttemptedSuggestion(true);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-category-with-ai', {
        body: {
          title: formData.title,
          description: formData.description
        }
      });

      

      if (error) {
        console.error('❌ AI category suggestion error:', error);
        return;
      }

      if (data?.suggestion) {
        const { mainCategory, subCategory, confidence, reasoning } = data.suggestion;

        

        // Auto-fill the categories
        updateFormData({
          mainCategory,
          subCategory
        });

        setAiSuggested(true);
      }
    } catch (error) {
      console.error('❌ Failed to get AI category suggestion:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, [formData.title, formData.description, formData.mainCategory, formData.subCategory, hasAttemptedSuggestion, updateFormData]);

  // Debounced AI suggestion - triggers 2 seconds after user stops typing
  useEffect(() => {
    // Only trigger if we have both title and description with sufficient length
    if (!formData.title.trim() || formData.title.length < 5) return;
    if (!formData.description.trim() || formData.description.length < 20) return;
    if (hasAttemptedSuggestion) return; // Only suggest once
    if (formData.mainCategory && formData.subCategory) return; // Don't override user selection

    // Debounce: Wait 2 seconds after user stops typing
    const timer = setTimeout(() => {
      
      suggestCategory();
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.mainCategory, formData.subCategory, hasAttemptedSuggestion, suggestCategory]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="title">Report Title *</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>A brief, clear summary of the issue (e.g., "Unethical hiring practices in HR department")</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Brief summary of the issue"
            className={`min-h-[44px] text-base ${validationErrors.title ? "border-destructive" : ""}`}
            autoComplete="off"
            maxLength={200}
          />
          {validationErrors.title && (
            <p className="text-sm text-destructive">{validationErrors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="mb-2">Include relevant details: What happened? When? Who was involved? Include any evidence or witnesses.</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI will automatically suggest categories as you type
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Please provide a detailed description of what happened..."
            rows={5}
            className={`text-base ${validationErrors.description ? "border-destructive" : ""}`}
            autoComplete="off"
            maxLength={5000}
          />
          {validationErrors.description && (
            <p className="text-sm text-destructive">{validationErrors.description}</p>
          )}
          {isLoadingSuggestion && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">
                AI is analyzing your report and suggesting categories...
              </span>
            </div>
          )}
        </div>

        {/* Privacy Scanner - shows privacy warnings */}
        <PrivacyScanner
          title={formData.title}
          description={formData.description}
          onAutoRedact={(redactedTitle, redactedDescription) => {
            updateFormData({
              title: redactedTitle,
              description: redactedDescription
            });
          }}
          className="mt-4"
        />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mainCategory">Main Category *</Label>
          {aiSuggested && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Suggested
            </Badge>
          )}
        </div>
        <Select value={formData.mainCategory} onValueChange={handleMainCategoryChange} required>
          <SelectTrigger className={validationErrors.mainCategory ? "border-destructive" : ""}>
            <SelectValue placeholder="Select a main category" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(MAIN_CATEGORIES).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.mainCategory && (
          <p className="text-sm text-destructive">{validationErrors.mainCategory}</p>
        )}
      </div>

      {formData.mainCategory && (
        <div className="space-y-2">
          <Label htmlFor="subCategory">Sub Category *</Label>
          <Select value={formData.subCategory} onValueChange={handleSubCategoryChange} required>
            <SelectTrigger className={validationErrors.subCategory ? "border-destructive" : ""}>
              <SelectValue placeholder="Select a sub category" />
            </SelectTrigger>
            <SelectContent>
              {availableSubCategories.map((subCategory) => (
                <SelectItem key={subCategory} value={subCategory}>
                  {subCategory}
                </SelectItem>
              ))}
              <SelectItem value="Other (Please Specify)">Other (Please Specify)</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.subCategory && (
            <p className="text-sm text-destructive">{validationErrors.subCategory}</p>
          )}
        </div>
      )}

      {formData.subCategory === "Other (Please Specify)" && (
        <div className="space-y-2">
          <Label htmlFor="customCategory">Please Specify Category *</Label>
          <Input
            id="customCategory"
            value={formData.customCategory}
            onChange={(e) => updateFormData({ customCategory: e.target.value })}
            placeholder="Enter the specific category"
            required
            className={`min-h-[44px] text-base ${validationErrors.customCategory ? "border-destructive" : ""}`}
            autoComplete="off"
            maxLength={100}
          />
          {validationErrors.customCategory && (
            <p className="text-sm text-destructive">{validationErrors.customCategory}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="priority">Priority Level</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>How urgent is this issue? Critical = immediate danger, High = significant impact, Medium = standard concern</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={formData.priority.toString()}
          onValueChange={(value) => updateFormData({ priority: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Critical (Immediate danger/serious violation)</SelectItem>
            <SelectItem value="2">2 - High (Significant impact)</SelectItem>
            <SelectItem value="3">3 - Medium (Standard concern)</SelectItem>
            <SelectItem value="4">4 - Low (Minor issue)</SelectItem>
            <SelectItem value="5">5 - Informational (General feedback)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default ReportDetailsForm;