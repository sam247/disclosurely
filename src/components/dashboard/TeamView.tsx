import UserManagement from '@/components/UserManagement';
import { useTranslation } from 'react-i18next';

const TeamView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
        <h1 className="text-3xl font-bold">{t('teamManagementTitle')}</h1>
        <p className="text-muted-foreground">{t('teamManagementDescription')}</p>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <UserManagement />
      </div>
    </div>
  );
};

export default TeamView;
