
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Building2, Shield, CreditCard } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import OrganizationSettings from './OrganizationSettings';
import SimpleGDPRSettings from './SimpleGDPRSettings';
import SubscriptionManagement from './SubscriptionManagement';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your profile, organization, subscription, and privacy settings
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organization
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

          <ScrollArea className="flex-1 mt-6" style={{ height: 'calc(80vh - 140px)' }}>
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="organization" className="mt-0">
              <OrganizationSettings />
            </TabsContent>

            <TabsContent value="subscription" className="mt-0">
              <SubscriptionManagement />
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <SimpleGDPRSettings />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
