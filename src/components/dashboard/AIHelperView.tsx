import AICaseHelper from '@/components/AICaseHelper';
import { useTranslation } from 'react-i18next';

const AIHelperView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t('aiCaseHelperTitle')}</h2>
        <p className="text-muted-foreground">{t('aiCaseHelperDescription')}</p>
      </div>
      <AICaseHelper />
    </div>
  );
};

export default AIHelperView;
