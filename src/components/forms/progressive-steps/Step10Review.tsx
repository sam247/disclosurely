import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Edit, Loader2, FileText, Tag, AlertTriangle, Calendar, MapPin, Paperclip, FileTextIcon } from 'lucide-react';
import { ProgressiveFormData } from '../ProgressiveReportForm';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

interface Step10ReviewProps {
  formData: ProgressiveFormData;
  attachedFiles: File[];
  onEdit: (step: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  language: string;
}

const Step10Review = ({ formData, attachedFiles, onEdit, onSubmit, isSubmitting, language }: Step10ReviewProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;

  const getUrgencyLabel = (priority: number) => {
    const labels = {
      1: t.step5.levels.critical.label,
      2: t.step5.levels.high.label,
      3: t.step5.levels.medium.label,
      4: t.step5.levels.low.label,
      5: t.step5.levels.low.label
    };
    return labels[priority as keyof typeof labels] || t.step5.levels.medium.label;
  };

  const getUrgencyColor = (priority: number) => {
    const colors = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-blue-100 text-blue-800 border-blue-200',
      5: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority as keyof typeof colors] || colors[3];
  };

  // Helper to get translated category name (same as in Step5Category)
  const getTranslatedMainCategory = (key: string) => {
    const categoryMap: Record<string, keyof typeof t.step4.categories> = {
      "Financial Misconduct": "financial",
      "Workplace Behaviour": "workplace",
      "Legal & Compliance": "legal",
      "Safety & Risk": "safety",
      "Data & Security": "data"
    };
    const categoryKey = categoryMap[key];
    return categoryKey ? t.step4.categories[categoryKey] : key;
  };

  const getTranslatedSubCategory = (mainCatKey: string, subCatKey: string) => {
    if (subCatKey === "Other (Please Specify)") return formData.customCategory;
    const categoryMap: Record<string, keyof typeof t.step4.categories> = {
      "Financial Misconduct": "financial",
      "Workplace Behaviour": "workplace",
      "Legal & Compliance": "legal",
      "Safety & Risk": "safety",
      "Data & Security": "data"
    };
    const mainCat = categoryMap[mainCatKey];
    if (!mainCat) return subCatKey;
    
    const subCatMap: Record<string, string> = {
      "Financial Misconduct": "subFinancial",
      "Workplace Behaviour": "subWorkplace",
      "Legal & Compliance": "subLegal",
      "Safety & Risk": "subSafety",
      "Data & Security": "subData"
    };
    const subCatType = subCatMap[mainCatKey] as keyof typeof t.step4.categories;
    const subCategories = t.step4.categories[subCatType] as Record<string, string>;
    
    const subCategoryKeyMap: Record<string, string> = {
      "Fraud": "fraud", "Bribery": "bribery", "Corruption": "corruption", "Embezzlement": "embezzlement",
      "Theft": "theft", "Kickbacks": "kickbacks", "Laundering": "laundering", "Insider": "insider",
      "Forgery": "forgery", "Collusion": "collusion", "Harassment": "harassment", "Discrimination": "discrimination",
      "Bullying": "bullying", "Retaliation": "retaliation", "Nepotism": "nepotism", "Favouritism": "favouritism",
      "Misconduct": "misconduct", "Exploitation": "exploitation", "Abuse": "abuse", "Compliance": "compliance",
      "Ethics": "ethics", "Manipulation": "manipulation", "Extortion": "extortion", "Coercion": "coercion",
      "Violation": "violation", "Safety": "safety", "Negligence": "negligence", "Hazards": "hazards",
      "Sabotage": "sabotage", "Privacy": "privacy", "Data": "data", "Security": "security", "Cyber": "cyber"
    };
    
    const subKey = subCategoryKeyMap[subCatKey];
    return subKey && subCategories ? subCategories[subKey] : subCatKey;
  };

  const reviewSections = [
    {
      step: 1,
      title: t.step9.sections.reportTitle,
      icon: FileText,
      content: formData.title,
      show: true
    },
    {
      step: 2,
      title: t.step9.sections.description,
      icon: FileTextIcon,
      content: formData.description,
      show: true,
      multiline: true
    },
    {
      step: 4,
      title: t.step9.sections.category,
      icon: Tag,
      content: `${getTranslatedMainCategory(formData.mainCategory)} - ${getTranslatedSubCategory(formData.mainCategory, formData.subCategory)}`,
      show: true
    },
    {
      step: 5,
      title: t.step9.sections.priority,
      icon: AlertTriangle,
      content: getUrgencyLabel(formData.priority),
      badge: true,
      badgeColor: getUrgencyColor(formData.priority),
      show: true
    },
    {
      step: 6,
      title: t.step9.sections.whenHappened,
      icon: Calendar,
      content: formData.incidentDate || t.step9.notSpecified,
      show: !!formData.incidentDate
    },
    {
      step: 6,
      title: t.step9.sections.whereHappened,
      icon: MapPin,
      content: formData.location || t.step9.notSpecified,
      show: !!formData.location
    },
    {
      step: 7,
      title: t.step9.sections.evidence,
      icon: Paperclip,
      content: attachedFiles.length > 0
        ? t.step9.filesAttached
            .replace('{count}', attachedFiles.length.toString())
            .replace('{plural}', attachedFiles.length > 1 ? 's' : '')
        : t.step9.noFiles,
      show: attachedFiles.length > 0
    },
    {
      step: 8,
      title: t.step9.sections.witnesses,
      icon: FileTextIcon,
      content: formData.witnesses || t.step9.noneSpecified,
      show: !!formData.witnesses
    },
    {
      step: 8,
      title: t.step9.sections.previousReports,
      icon: FileTextIcon,
      content: formData.previousReports ? t.step9.reportedBefore : t.step9.firstTime,
      show: formData.previousReports
    },
    {
      step: 8,
      title: t.step9.sections.additionalNotes,
      icon: FileTextIcon,
      content: formData.additionalNotes || t.step9.none,
      show: !!formData.additionalNotes,
      multiline: true
    }
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t.step9.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t.step9.subtitle}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          {t.step9.info}
        </p>
      </div>

      <div className="space-y-3">
        {reviewSections.filter(section => section.show).map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="border-2">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <Icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{section.title}</p>
                      {section.badge ? (
                        <Badge className={section.badgeColor}>
                          {section.content}
                        </Badge>
                      ) : (
                        <p className={`text-sm sm:text-base text-gray-900 ${section.multiline ? 'whitespace-pre-wrap break-words' : 'break-words'}`}>
                          {section.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(section.step)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {attachedFiles.length > 0 && (
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Paperclip className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{t.step9.attachedFiles.replace('{count}', attachedFiles.length.toString())}</p>
                <ul className="space-y-1">
                  {attachedFiles.map((file, i) => (
                    <li key={i} className="text-sm text-gray-700 truncate">
                      • {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-green-900 mb-2">{t.step9.readyTitle}</h3>
            <p className="text-xs sm:text-sm text-green-800 mb-3 sm:mb-4">
              {t.step9.readyDesc}
            </p>
            <ul className="text-xs sm:text-sm text-green-800 space-y-1 list-disc list-inside mb-3 sm:mb-4">
              <li>{t.step9.readyList1}</li>
              <li>{t.step9.readyList2}</li>
              <li>{t.step9.readyList3}</li>
              <li>{t.step9.readyList4}</li>
            </ul>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white h-12 sm:h-11 text-base sm:text-lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span className="text-sm sm:text-base">{t.step9.submitting}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">{t.step9.submitButton}</span>
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        {t.step9.confirmText}
      </p>
    </div>
  );
};

export default Step10Review;
