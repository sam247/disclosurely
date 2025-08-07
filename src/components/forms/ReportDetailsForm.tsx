
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PREDEFINED_CATEGORIES = [
  "Bribery",
  "Fraud", 
  "GDPR",
  "Corruption",
  "Failure to comply with laws and regulation",
  "Endangering the health & safety of individuals",
  "Other (Please Specify)"
];

interface ReportDetailsFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    customCategory: string;
    priority: number;
  };
  updateFormData: (updates: Partial<typeof formData>) => void;
}

const ReportDetailsForm = ({ formData, updateFormData }: ReportDetailsFormProps) => {
  const handleCategoryChange = (value: string) => {
    updateFormData({ 
      category: value,
      customCategory: value === "Other (Please Specify)" ? formData.customCategory : ""
    });
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={handleCategoryChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.category === "Other (Please Specify)" && (
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
