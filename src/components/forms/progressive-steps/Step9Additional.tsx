import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, History } from 'lucide-react';

interface Step9AdditionalProps {
  witnesses: string;
  previousReports: boolean;
  additionalNotes: string;
  onChange: (updates: { witnesses?: string; previousReports?: boolean; additionalNotes?: string }) => void;
}

const Step9Additional = ({ witnesses, previousReports, additionalNotes, onChange }: Step9AdditionalProps) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Anything else we should know?
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            All fields on this page are optional
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          ℹ️ These details can help with the investigation, but you can skip this step if you prefer.
        </p>
      </div>

      <div className="space-y-6">
        {/* Witnesses */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <Label htmlFor="witnesses" className="text-base">
              Were there any witnesses? (Optional)
            </Label>
          </div>
          <Input
            id="witnesses"
            value={witnesses}
            onChange={(e) => onChange({ witnesses: e.target.value })}
            placeholder="e.g., 'Two colleagues from the same department' (avoid specific names)"
            className="min-h-[48px] text-base"
            maxLength={200}
          />
          <p className="text-xs text-gray-500">
            Describe witnesses without revealing identifying details
          </p>
        </div>

        {/* Previous Reports */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            <Label htmlFor="previousReports" className="text-base">
              Have you reported this before? (Optional)
            </Label>
          </div>
          <Select
            value={previousReports ? "yes" : "no"}
            onValueChange={(value) => onChange({ previousReports: value === "yes" })}
          >
            <SelectTrigger className="min-h-[48px] text-base">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no" className="text-base">No, this is my first report</SelectItem>
              <SelectItem value="yes" className="text-base">Yes, I've reported this before</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <Label htmlFor="additionalNotes" className="text-base">
              Additional Notes (Optional)
            </Label>
          </div>
          <Textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => onChange({ additionalNotes: e.target.value })}
            placeholder="Any other relevant information you'd like to share..."
            className="min-h-[120px] text-base resize-none"
            maxLength={1000}
          />
          <div className="flex justify-end">
            <span className="text-xs text-gray-400">{additionalNotes.length}/1000</span>
          </div>
        </div>
      </div>

      {(witnesses || previousReports || additionalNotes) && (
        <p className="text-sm text-green-600">
          ✓ Additional context provided
        </p>
      )}
    </div>
  );
};

export default Step9Additional;
