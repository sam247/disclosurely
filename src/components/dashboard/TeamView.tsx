import UserManagement from '@/components/UserManagement';
import { useTranslation } from 'react-i18next';

const TeamView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('teamManagementTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('teamManagementDescription')}</p>
      </div>
      <UserManagement />
    </div>
  );
};

export default TeamView;
