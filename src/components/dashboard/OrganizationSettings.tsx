import { Palette, Globe, Link2 } from 'lucide-react';
import OrganizationSettingsBranding from '@/components/OrganizationSettings';
import CustomDomainSettings from '@/components/CustomDomainSettings';
import ReportingPortalUrlSettings from '@/components/ReportingPortalUrlSettings';
import { Separator } from '@/components/ui/separator';

const OrganizationSettings = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b bg-background">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your organization's branding and custom domains</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-8">
        {/* Branding Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Branding</h2>
          </div>
          <OrganizationSettingsBranding />
        </div>

        <Separator />

        {/* Reporting Portal URL Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Reporting Portal URL</h2>
          </div>
          <ReportingPortalUrlSettings />
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
    </div>
  );
};

export default OrganizationSettings;
