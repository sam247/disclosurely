import OrganizationSettings from '@/components/OrganizationSettings';
import { useTranslation } from 'react-i18next';

const BrandingView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('customBrandingTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('customBrandingDescription')}</p>
      </div>
      <OrganizationSettings />
    </div>
  );
};

export default BrandingView;
