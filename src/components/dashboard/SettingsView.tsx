import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CreditCard, Shield } from 'lucide-react';
import ProfileSettings from '@/components/ProfileSettings';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import SimpleGDPRSettings from '@/components/SimpleGDPRSettings';

const SettingsView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your profile, subscription, and privacy settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Data
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
