import { Palette, Globe } from 'lucide-react';
import OrganizationSettingsBranding from '@/components/OrganizationSettings';
import CustomDomainSettings from '@/components/CustomDomainSettings';
import { Separator } from '@/components/ui/separator';

const OrganizationSettings = () => {
  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Organization Settings</h2>
        <p className="text-muted-foreground">Manage your organization's branding and custom domains</p>
      </div>

      <Separator />

      {/* Branding Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Organization Branding</h3>
        </div>
        <OrganizationSettingsBranding />
      </div>

      <Separator />

      {/* Custom Domains Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Custom Domains</h3>
        </div>
        <CustomDomainSettings />
      </div>
    </div>
  );
};

export default OrganizationSettings;
