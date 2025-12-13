import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, CreditCard, Globe, Shield } from 'lucide-react';
import OrganizationSettingsBranding from '@/components/OrganizationSettings';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import CustomDomainSettings from '@/components/CustomDomainSettings';
import SimpleGDPRSettings from '@/components/SimpleGDPRSettings';
import { useUserRoles } from '@/hooks/useUserRoles';

const OrganizationSettings = () => {
  const { t } = useTranslation();
  const { isOrgAdmin } = useUserRoles();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b bg-background">
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization, team, subscription, and privacy settings. Profile settings are available in the top-right menu.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 pt-6">
          {isOrgAdmin && (
            <>
              {/* Organization Settings */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Organization
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your organization's branding and settings
                  </p>
                </div>
                <OrganizationSettingsBranding />
              </div>

              {/* Subscription */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Subscription
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your subscription and billing information
                  </p>
                </div>
                <SubscriptionManagement />
              </div>

              {/* Custom Domains */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Custom Domains
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure custom domains for your secure reporting links
                  </p>
                </div>
                <CustomDomainSettings />
              </div>
            </>
          )}

          {/* Privacy & Data - Always visible */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Privacy & Data
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your privacy settings and data handling preferences
              </p>
            </div>
            <SimpleGDPRSettings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
