import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin } from 'lucide-react';

interface Step7WhenWhereProps {
  incidentDate: string;
  location: string;
  onChange: (updates: { incidentDate?: string; location?: string }) => void;
}

const Step7WhenWhere = ({ incidentDate, location, onChange }: Step7WhenWhereProps) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            When and where did this happen?
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            These details are optional but helpful
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            You can be as vague or specific as you're comfortable with. Protecting your anonymity is our priority.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Label htmlFor="incidentDate" className="text-base">
              When did this happen? (Optional)
            </Label>
          </div>
          <Input
            id="incidentDate"
            type="text"
            value={incidentDate}
            onChange={(e) => onChange({ incidentDate: e.target.value })}
            placeholder="e.g., 'Last week', 'October 2024', or leave blank"
            className="min-h-[48px] text-base"
          />
          <p className="text-xs text-gray-500">
            You can provide an approximate timeframe if you prefer not to give an exact date
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Label htmlFor="location" className="text-base">
              Where did this happen? (Optional)
            </Label>
          </div>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g., 'Main office', 'Warehouse', or leave blank"
            className="min-h-[48px] text-base"
          />
          <p className="text-xs text-gray-500">
            General location (like department or building) is fine - avoid specifics that could identify you
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-900 font-medium mb-2">💡 Privacy Tip:</p>
        <p className="text-sm text-purple-800">
          Instead of "3rd floor engineering, desk 42", consider "Engineering department" or just "Office building".
          The less specific you are, the better protected your identity.
        </p>
      </div>

      {(incidentDate || location) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ Context provided
            {incidentDate && `: Occurred ${incidentDate}`}
            {location && ` at ${location}`}
          </p>
        </div>
      )}
    </div>
  );
};

// Import Info icon
import { Info } from 'lucide-react';

export default Step7WhenWhere;
