import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

interface Step7WhenWhereProps {
  incidentDate: string;
  location: string;
  onChange: (updates: { incidentDate?: string; location?: string }) => void;
  language: string;
}

const Step7WhenWhere = ({ incidentDate, location, onChange, language }: Step7WhenWhereProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {t.step6.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.step6.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Label htmlFor="incidentDate" className="text-base">
              {t.step6.whenLabel}
            </Label>
          </div>
          <Input
            id="incidentDate"
            type="text"
            value={incidentDate}
            onChange={(e) => onChange({ incidentDate: e.target.value })}
            placeholder={t.step6.whenPlaceholder}
            className="min-h-[48px] text-base"
          />
          <p className="text-xs text-gray-500">
            {t.step6.whenHint}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Label htmlFor="location" className="text-base">
              {t.step6.whereLabel}
            </Label>
          </div>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder={t.step6.wherePlaceholder}
            className="min-h-[48px] text-base"
          />
          <p className="text-xs text-gray-500">
            {t.step6.whereHint}
          </p>
        </div>
      </div>

      {(incidentDate || location) && (
        <p className="text-sm text-green-600 mt-2">
          {t.step6.contextProvided}
          {incidentDate && `: ${t.step6.occurred} ${incidentDate}`}
          {location && ` ${t.step6.at} ${location}`}
        </p>
      )}
    </div>
  );
};

export default Step7WhenWhere;
