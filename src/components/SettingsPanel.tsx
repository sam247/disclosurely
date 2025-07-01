
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
      <DialogContent className="max-w-4xl h-[85vh] sm:h-[80vh] max-h-[90vh] w-[95vw] sm:w-full flex flex-col mx-4">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-lg sm:text-xl">Settings</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Manage your profile, organization, subscription, and privacy settings
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0 h-auto">
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Prof.</span>
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Organization</span>
              <span className="sm:hidden">Org.</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Subscription</span>
              <span className="sm:hidden">Sub.</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Privacy & Data</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 sm:mt-6" style={{ height: 'calc(85vh - 180px)' }}>
            <div className="px-1 sm:px-0">
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
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
