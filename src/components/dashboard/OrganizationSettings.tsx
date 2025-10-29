import { Palette, Globe } from 'lucide-react';
import OrganizationSettingsBranding from '@/components/OrganizationSettings';
import CustomDomainSettings from '@/components/CustomDomainSettings';
import { Separator } from '@/components/ui/separator';

const OrganizationSettings = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your organization's branding and custom domains</p>
      </div>

      <Separator />

      {/* Branding Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Branding</h2>
        </div>
        <OrganizationSettingsBranding />
      </div>

      <Separator />

      {/* Custom Domains Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Custom Domains</h2>
        </div>
        <CustomDomainSettings />
      </div>
    </div>
  );
};

export default OrganizationSettings;
