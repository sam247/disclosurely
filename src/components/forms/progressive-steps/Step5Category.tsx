import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, Sparkles } from 'lucide-react';

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

interface Step5CategoryProps {
  mainCategory: string;
  subCategory: string;
  customCategory: string;
  onChange: (updates: { mainCategory?: string; subCategory?: string; customCategory?: string }) => void;
  isValid: boolean;
}

const Step5Category = ({ mainCategory, subCategory, customCategory, onChange, isValid }: Step5CategoryProps) => {
  const [aiSuggested, setAiSuggested] = useState(!!mainCategory && !!subCategory);

  const handleMainCategoryChange = (value: string) => {
    onChange({
      mainCategory: value,
      subCategory: '',
      customCategory: ''
    });
    setAiSuggested(false);
  };

  const handleSubCategoryChange = (value: string) => {
    onChange({
      subCategory: value,
      customCategory: value === "Other (Please Specify)" ? customCategory : ""
    });
    setAiSuggested(false);
  };

  const availableSubCategories = mainCategory ? MAIN_CATEGORIES[mainCategory as keyof typeof MAIN_CATEGORIES] || [] : [];

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Tag className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Categorize your report
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Help us route this to the right team
          </p>
        </div>
      </div>

      {aiSuggested && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Badge variant="outline" className="text-xs bg-white text-primary border-primary/20">
              AI Suggested
            </Badge>
          </div>
          <p className="text-sm text-primary/80 mt-2">
            Based on your description, we've pre-selected the most relevant category. Feel free to change it if needed.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mainCategory" className="text-base">
            Main Category *
          </Label>
          <Select value={mainCategory} onValueChange={handleMainCategoryChange}>
            <SelectTrigger className="min-h-[48px] text-base">
              <SelectValue placeholder="Select a main category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(MAIN_CATEGORIES).map((category) => (
                <SelectItem key={category} value={category} className="text-base">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {mainCategory && (
          <div className="space-y-2">
            <Label htmlFor="subCategory" className="text-base">
              Sub Category *
            </Label>
            <Select value={subCategory} onValueChange={handleSubCategoryChange}>
              <SelectTrigger className="min-h-[48px] text-base">
                <SelectValue placeholder="Select a sub category" />
              </SelectTrigger>
              <SelectContent>
                {availableSubCategories.map((subCat) => (
                  <SelectItem key={subCat} value={subCat} className="text-base">
                    {subCat}
                  </SelectItem>
                ))}
                <SelectItem value="Other (Please Specify)" className="text-base">
                  Other (Please Specify)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {subCategory === "Other (Please Specify)" && (
          <div className="space-y-2">
            <Label htmlFor="customCategory" className="text-base">
              Please Specify Category *
            </Label>
            <Input
              id="customCategory"
              value={customCategory}
              onChange={(e) => onChange({ customCategory: e.target.value })}
              placeholder="Enter the specific category"
              className="min-h-[48px] text-base"
              maxLength={100}
            />
          </div>
        )}
      </div>

      {!isValid && mainCategory && (
        <p className="text-sm text-amber-600">Please select both main and sub category</p>
      )}

      {isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ Category selected: <strong>{mainCategory} - {subCategory === "Other (Please Specify)" ? customCategory : subCategory}</strong>
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">💡 Why categorize?</p>
        <p className="text-sm text-blue-800">
          Categories help ensure your report reaches the right people who can take appropriate action. This speeds up the review and response process.
        </p>
      </div>
    </div>
  );
};

export default Step5Category;
