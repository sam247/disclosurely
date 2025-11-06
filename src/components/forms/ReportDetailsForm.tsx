import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  const suggestCategory = async () => {
    console.log('🔍 suggestCategory called', {
      hasTitle: !!formData.title.trim(),
      hasDescription: !!formData.description.trim(),
      hasAttemptedSuggestion,
      hasCategories: !!(formData.mainCategory && formData.subCategory)
    });

    // Only suggest if we have both title and description, haven't already suggested, and categories aren't already set
    if (!formData.title.trim() || !formData.description.trim() || hasAttemptedSuggestion) {
      console.log('⏭️ Skipping suggestion - missing requirements');
      return;
    }

    // Don't override if user has already selected categories
    if (formData.mainCategory && formData.subCategory) {
      console.log('⏭️ Skipping suggestion - categories already set');
      return;
    }

    console.log('🤖 Calling AI for category suggestion...');
    setIsLoadingSuggestion(true);
    setHasAttemptedSuggestion(true);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-category-with-ai', {
        body: {
          title: formData.title,
          description: formData.description
        }
      });

      console.log('🤖 AI response:', { data, error });

      if (error) {
        console.error('❌ AI category suggestion error:', error);
        return;
      }

      if (data?.suggestion) {
        const { mainCategory, subCategory, confidence, reasoning } = data.suggestion;

        console.log('✅ AI suggested:', { mainCategory, subCategory, confidence, reasoning });

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
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Report Title *</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="Brief summary of the issue"
          className={validationErrors.title ? "border-destructive" : ""}
        />
        {validationErrors.title && (
          <p className="text-sm text-destructive">{validationErrors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description *</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          onBlur={suggestCategory}
          placeholder="Please provide a detailed description of what happened..."
          rows={4}
          className={validationErrors.description ? "border-destructive" : ""}
        />
        {validationErrors.description && (
          <p className="text-sm text-destructive">{validationErrors.description}</p>
        )}
        {isLoadingSuggestion && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            AI is analyzing and suggesting categories...
          </p>
        )}
      </div>

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
            className={validationErrors.customCategory ? "border-destructive" : ""}
          />
          {validationErrors.customCategory && (
            <p className="text-sm text-destructive">{validationErrors.customCategory}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="priority">Priority Level</Label>
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
  );
};

export default ReportDetailsForm;