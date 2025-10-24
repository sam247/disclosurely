import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Globe } from 'lucide-react';
import BrandingView from '@/components/dashboard/BrandingView';
import CustomDomainSettings from '@/components/CustomDomainSettings';
import { useTranslation } from 'react-i18next';

const OrganizationSettings = () => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Organization Settings</h2>
        <p className="text-muted-foreground">Manage your organization's branding and custom domains</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Custom Domains
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <BrandingView />
        </TabsContent>

        <TabsContent value="domains">
          <CustomDomainSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationSettings;
