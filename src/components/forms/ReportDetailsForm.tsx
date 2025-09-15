import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

const ReportDetailsForm = ({ formData, updateFormData }: ReportDetailsFormProps) => {
  const handleMainCategoryChange = (value: string) => {
    updateFormData({ 
      mainCategory: value,
      subCategory: '', // Reset subcategory when main category changes
      customCategory: ''
    });
  };

  const handleSubCategoryChange = (value: string) => {
    updateFormData({ 
      subCategory: value,
      customCategory: value === "Other (Please Specify)" ? formData.customCategory : ""
    });
  };

  const availableSubCategories = formData.mainCategory ? MAIN_CATEGORIES[formData.mainCategory as keyof typeof MAIN_CATEGORIES] || [] : [];

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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mainCategory">Main Category *</Label>
        <Select value={formData.mainCategory} onValueChange={handleMainCategoryChange} required>
          <SelectTrigger>
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
      </div>

      {formData.mainCategory && (
        <div className="space-y-2">
          <Label htmlFor="subCategory">Sub Category *</Label>
          <Select value={formData.subCategory} onValueChange={handleSubCategoryChange} required>
            <SelectTrigger>
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
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description *</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Please provide a detailed description of what happened..."
          rows={4}
        />
      </div>

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