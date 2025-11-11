import React from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { Building2, Users, CreditCard, Globe, Shield } from 'lucide-react';
import OrganizationSettingsBranding from '@/components/OrganizationSettings';
import UserManagement from '@/components/UserManagement';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import CustomDomainSettings from '@/components/CustomDomainSettings';
import SimpleGDPRSettings from '@/components/SimpleGDPRSettings';
import { useUserRoles } from '@/hooks/useUserRoles';

const OrganizationSettings = () => {
  const { t } = useTranslation();
  const { isOrgAdmin } = useUserRoles();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Manage your organization, team, subscription, and privacy settings. Profile settings are available in the top-right menu.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
        {isOrgAdmin && (
          <>
            <Separator className="my-6 sm:my-8" />

            {/* Organization Settings */}
            <section>
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-semibold">Organization</h2>
              </div>
              <OrganizationSettingsBranding />
            </section>

            <Separator className="my-6 sm:my-8" />

            {/* Team Management */}
            <section>
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-semibold">Team</h2>
              </div>
              <UserManagement />
            </section>

            <Separator className="my-6 sm:my-8" />

            {/* Subscription */}
            <section>
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-semibold">Subscription</h2>
              </div>
              <SubscriptionManagement />
            </section>

            <Separator className="my-6 sm:my-8" />

            {/* Custom Domains */}
            <section>
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-semibold">Custom Domains</h2>
              </div>
              <CustomDomainSettings />
            </section>
          </>
        )}

        <Separator className="my-6 sm:my-8" />

        {/* Privacy & Data - Always visible */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold">Privacy & Data</h2>
          </div>
          <SimpleGDPRSettings />
        </section>
      </div>
    </div>
  );
};

export default OrganizationSettings;
