import OrganizationSettings from '@/components/dashboard/OrganizationSettings';
import { useTranslation } from 'react-i18next';

const BrandingView = () => {
  const { t } = useTranslation();
  
  return (
    <OrganizationSettings />
  );
};

export default BrandingView;
