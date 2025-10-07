import OrganizationSettings from '@/components/OrganizationSettings';
import { useTranslation } from 'react-i18next';

const BrandingView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t('customBrandingTitle')}</h2>
        <p className="text-muted-foreground">{t('customBrandingDescription')}</p>
      </div>
      <OrganizationSettings />
    </div>
  );
};

export default BrandingView;
