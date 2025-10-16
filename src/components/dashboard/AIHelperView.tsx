import AICaseHelper from '@/components/AICaseHelper';
import { useTranslation } from 'react-i18next';

const AIHelperView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('aiCaseHelperTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('aiCaseHelperDescription')}</p>
      </div>
      <AICaseHelper />
    </div>
  );
};

export default AIHelperView;
