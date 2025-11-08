import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, Sparkles } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

// English keys for internal storage
const MAIN_CATEGORY_KEYS = {
  financial: "Financial Misconduct",
  workplace: "Workplace Behaviour",
  legal: "Legal & Compliance",
  safety: "Safety & Risk",
  data: "Data & Security"
};

const SUB_CATEGORY_KEYS = {
  financial: {
    fraud: "Fraud",
    bribery: "Bribery",
    corruption: "Corruption",
    embezzlement: "Embezzlement",
    theft: "Theft",
    kickbacks: "Kickbacks",
    laundering: "Laundering",
    insider: "Insider",
    forgery: "Forgery",
    collusion: "Collusion"
  },
  workplace: {
    harassment: "Harassment",
    discrimination: "Discrimination",
    bullying: "Bullying",
    retaliation: "Retaliation",
    nepotism: "Nepotism",
    favouritism: "Favouritism",
    misconduct: "Misconduct",
    exploitation: "Exploitation",
    abuse: "Abuse"
  },
  legal: {
    compliance: "Compliance",
    ethics: "Ethics",
    manipulation: "Manipulation",
    extortion: "Extortion",
    coercion: "Coercion",
    violation: "Violation"
  },
  safety: {
    safety: "Safety",
    negligence: "Negligence",
    hazards: "Hazards",
    sabotage: "Sabotage"
  },
  data: {
    privacy: "Privacy",
    data: "Data",
    security: "Security",
    cyber: "Cyber"
  }
};

interface Step5CategoryProps {
  mainCategory: string;
  subCategory: string;
  customCategory: string;
  onChange: (updates: { mainCategory?: string; subCategory?: string; customCategory?: string }) => void;
  isValid: boolean;
  language: string;
}

const Step5Category = ({ mainCategory, subCategory, customCategory, onChange, isValid, language }: Step5CategoryProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
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

  // Helper to get translated category name
  const getTranslatedMainCategory = (key: string): string => {
    const categoryMap: Record<string, keyof typeof t.step4.categories> = {
      "Financial Misconduct": "financial",
      "Workplace Behaviour": "workplace",
      "Legal & Compliance": "legal",
      "Safety & Risk": "safety",
      "Data & Security": "data"
    };
    const categoryKey = categoryMap[key];
    const translated = categoryKey ? t.step4.categories[categoryKey] : key;
    return typeof translated === 'string' ? translated : key;
  };

  // Helper to get translated subcategory name
  const getTranslatedSubCategory = (mainCatKey: string, subCatKey: string): string => {
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
    
    // Map English subcategory to translation key
    const subCategoryKeyMap: Record<string, string> = {
      "Fraud": "fraud",
      "Bribery": "bribery",
      "Corruption": "corruption",
      "Embezzlement": "embezzlement",
      "Theft": "theft",
      "Kickbacks": "kickbacks",
      "Laundering": "laundering",
      "Insider": "insider",
      "Forgery": "forgery",
      "Collusion": "collusion",
      "Harassment": "harassment",
      "Discrimination": "discrimination",
      "Bullying": "bullying",
      "Retaliation": "retaliation",
      "Nepotism": "nepotism",
      "Favouritism": "favouritism",
      "Misconduct": "misconduct",
      "Exploitation": "exploitation",
      "Abuse": "abuse",
      "Compliance": "compliance",
      "Ethics": "ethics",
      "Manipulation": "manipulation",
      "Extortion": "extortion",
      "Coercion": "coercion",
      "Violation": "violation",
      "Safety": "safety",
      "Negligence": "negligence",
      "Hazards": "hazards",
      "Sabotage": "sabotage",
      "Privacy": "privacy",
      "Data": "data",
      "Security": "security",
      "Cyber": "cyber"
    };
    
    const subKey = subCategoryKeyMap[subCatKey];
    const translated = subKey && subCategories ? subCategories[subKey] : subCatKey;
    return typeof translated === 'string' ? translated : subCatKey;
  };

  // Get available subcategories for the selected main category
  const getAvailableSubCategories = () => {
    if (!mainCategory) return [];
    const categoryMap: Record<string, keyof typeof SUB_CATEGORY_KEYS> = {
      "Financial Misconduct": "financial",
      "Workplace Behaviour": "workplace",
      "Legal & Compliance": "legal",
      "Safety & Risk": "safety",
      "Data & Security": "data"
    };
    const catKey = categoryMap[mainCategory];
    return catKey ? Object.values(SUB_CATEGORY_KEYS[catKey]) : [];
  };

  const availableSubCategories = getAvailableSubCategories();

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Tag className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t.step4.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t.step4.subtitle}
          </p>
        </div>
      </div>

      {aiSuggested && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Badge variant="outline" className="text-xs bg-white text-primary border-primary/20">
              {t.step4.aiSuggested}
            </Badge>
          </div>
          <p className="text-sm text-primary/80 mt-2">
            {t.step4.aiSuggestedDesc}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mainCategory" className="text-base">
            {t.step4.mainCategory}
          </Label>
          <Select value={mainCategory} onValueChange={handleMainCategoryChange}>
            <SelectTrigger className="min-h-[48px] text-base">
              <SelectValue placeholder={t.step4.mainCategoryPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(MAIN_CATEGORY_KEYS).map((key) => {
                const categoryKey = key as keyof typeof MAIN_CATEGORY_KEYS;
                const englishKey = MAIN_CATEGORY_KEYS[categoryKey];
                return (
                  <SelectItem key={englishKey} value={englishKey} className="text-base">
                    {getTranslatedMainCategory(englishKey)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {mainCategory && (
          <div className="space-y-2">
            <Label htmlFor="subCategory" className="text-base">
              {t.step4.subCategory}
            </Label>
            <Select value={subCategory} onValueChange={handleSubCategoryChange}>
              <SelectTrigger className="min-h-[48px] text-base">
                <SelectValue placeholder={t.step4.subCategoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {availableSubCategories.map((subCat) => (
                  <SelectItem key={subCat} value={subCat} className="text-base">
                    {getTranslatedSubCategory(mainCategory, subCat)}
                  </SelectItem>
                ))}
                <SelectItem value="Other (Please Specify)" className="text-base">
                  {t.step4.otherCategory}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {subCategory === "Other (Please Specify)" && (
          <div className="space-y-2">
            <Label htmlFor="customCategory" className="text-base">
              {t.step4.customCategory}
            </Label>
            <Input
              id="customCategory"
              value={customCategory}
              onChange={(e) => onChange({ customCategory: e.target.value })}
              placeholder={t.step4.customCategoryPlaceholder}
              className="min-h-[48px] text-base"
              maxLength={100}
            />
          </div>
        )}
      </div>

      {!isValid && mainCategory && (
        <p className="text-sm text-amber-600">{t.step4.selectBoth}</p>
      )}

      {isValid && (
        <p className="text-sm text-green-600">
          {t.step4.categorySelected} <strong>{getTranslatedMainCategory(mainCategory)} - {subCategory === "Other (Please Specify)" ? customCategory : getTranslatedSubCategory(mainCategory, subCategory)}</strong>
        </p>
      )}
    </div>
  );
};

export default Step5Category;
