import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, History } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

interface Step9AdditionalProps {
  witnesses: string;
  previousReports: boolean;
  additionalNotes: string;
  onChange: (updates: { witnesses?: string; previousReports?: boolean; additionalNotes?: string }) => void;
  language: string;
}

const Step9Additional = ({ witnesses, previousReports, additionalNotes, onChange, language }: Step9AdditionalProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t.step8.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t.step8.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Witnesses */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <Label htmlFor="witnesses" className="text-base">
              {t.step8.witnessesLabel}
            </Label>
          </div>
          <Input
            id="witnesses"
            value={witnesses}
            onChange={(e) => onChange({ witnesses: e.target.value })}
            placeholder={t.step8.witnessesPlaceholder}
            className="min-h-[48px] text-base"
            maxLength={200}
          />
          <p className="text-xs text-gray-500">
            {t.step8.witnessesHint}
          </p>
        </div>

        {/* Previous Reports */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            <Label htmlFor="previousReports" className="text-base">
              {t.step8.previousReportsLabel}
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
              <SelectItem value="no" className="text-base">{t.step8.previousReportsNo}</SelectItem>
              <SelectItem value="yes" className="text-base">{t.step8.previousReportsYes}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <Label htmlFor="additionalNotes" className="text-base">
              {t.step8.additionalNotesLabel}
            </Label>
          </div>
          <Textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => onChange({ additionalNotes: e.target.value })}
            placeholder={t.step8.additionalNotesPlaceholder}
            className="min-h-[80px] sm:min-h-[120px] text-base resize-none"
            maxLength={1000}
          />
          <div className="flex justify-end">
            <span className="text-xs text-gray-400">{additionalNotes.length}{t.step8.additionalNotesCharCount}</span>
          </div>
        </div>
      </div>

      {(witnesses || previousReports || additionalNotes) && (
        <p className="text-sm text-green-600">
          {t.step8.contextProvided}
        </p>
      )}
    </div>
  );
};

export default Step9Additional;
