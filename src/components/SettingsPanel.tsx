
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Building2, Shield, FileText } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import OrganizationSettings from './OrganizationSettings';
import GDPRSettings from './GDPRSettings';

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
            Manage your profile, organization, and compliance settings
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
            <TabsTrigger value="gdpr" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy & GDPR
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-6">
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="organization" className="mt-0">
              <OrganizationSettings />
            </TabsContent>

            <TabsContent value="gdpr" className="mt-0">
              <GDPRSettings />
            </TabsContent>

            <TabsContent value="compliance" className="mt-0">
              <div className="space-y-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Compliance Tools</h3>
                  <p className="text-gray-600">
                    Additional compliance features and reporting tools will be available here.
                  </p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
