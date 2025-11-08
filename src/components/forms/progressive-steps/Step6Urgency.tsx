import { Label } from '@/components/ui/label';
import { AlertTriangle, Clock, Info, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

interface Step6UrgencyProps {
  priority: number;
  onChange: (priority: number) => void;
  language: string;
}

const Step6Urgency = ({ priority, onChange, language }: Step6UrgencyProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;

  const urgencyLevels = [
    {
      value: 1,
      label: t.step5.levels.critical.label,
      icon: Flame,
      description: t.step5.levels.critical.desc,
      color: 'border-red-500 bg-red-50 hover:bg-red-100 text-red-900',
      iconColor: 'text-red-600',
      activeColor: 'border-red-600 bg-red-100 ring-2 ring-red-500'
    },
    {
      value: 2,
      label: t.step5.levels.high.label,
      icon: AlertTriangle,
      description: t.step5.levels.high.desc,
      color: 'border-orange-500 bg-orange-50 hover:bg-orange-100 text-orange-900',
      iconColor: 'text-orange-600',
      activeColor: 'border-orange-600 bg-orange-100 ring-2 ring-orange-500'
    },
    {
      value: 3,
      label: t.step5.levels.medium.label,
      icon: Clock,
      description: t.step5.levels.medium.desc,
      color: 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100 text-yellow-900',
      iconColor: 'text-yellow-600',
      activeColor: 'border-yellow-600 bg-yellow-100 ring-2 ring-yellow-500'
    },
    {
      value: 4,
      label: t.step5.levels.low.label,
      icon: Info,
      description: t.step5.levels.low.desc,
      color: 'border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-900',
      iconColor: 'text-blue-600',
      activeColor: 'border-blue-600 bg-blue-100 ring-2 ring-blue-500'
    }
  ];
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <AlertTriangle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t.step5.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t.step5.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base">{t.step5.label}</Label>
        <div className="grid gap-3 mt-3">
          {urgencyLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = priority === level.value;

            return (
              <button
                key={level.value}
                type="button"
                onClick={() => onChange(level.value)}
                className={cn(
                  "w-full p-3 border-2 rounded-lg text-left transition-all cursor-pointer flex items-start gap-3",
                  isSelected ? level.activeColor : level.color
                )}
              >
                <div className={cn("p-1.5 rounded-lg bg-white flex-shrink-0", level.iconColor)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">{level.label}</span>
                    {isSelected && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white font-medium">
                        {t.step5.selected}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">{level.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {priority > 0 && (
        <p className="text-sm text-green-600">
          {t.step5.prioritySet} <strong>{urgencyLevels.find(l => l.value === priority)?.label}</strong>
        </p>
      )}
    </div>
  );
};

export default Step6Urgency;
