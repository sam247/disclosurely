import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Shield } from 'lucide-react';
import ProfileSettings from '@/components/ProfileSettings';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import SimpleGDPRSettings from '@/components/SimpleGDPRSettings';
import { useTranslation } from 'react-i18next';

const SettingsView = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t('profileSettingsTitle')}</h2>
        <p className="text-muted-foreground">{t('profileSettingsDescription')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            {t('account')}
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t('subscription')}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('privacyData')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="privacy">
          <SimpleGDPRSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsView;
