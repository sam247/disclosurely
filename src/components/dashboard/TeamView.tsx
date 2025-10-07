import UserManagement from '@/components/UserManagement';
import { useTranslation } from 'react-i18next';

const TeamView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t('teamManagementTitle')}</h2>
        <p className="text-muted-foreground">{t('teamManagementDescription')}</p>
      </div>
      <UserManagement />
    </div>
  );
};

export default TeamView;
