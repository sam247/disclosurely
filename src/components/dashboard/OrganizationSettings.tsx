import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, CreditCard, Globe, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="space-y-6">
          {isOrgAdmin && (
            <>
              {/* Organization Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>Organization</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your organization's branding and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrganizationSettingsBranding />
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span>Subscription</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionManagement />
                </CardContent>
              </Card>

              {/* Custom Domains */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span>Custom Domains</span>
                  </CardTitle>
                  <CardDescription>
                    Configure custom domains for your secure reporting links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomDomainSettings />
                </CardContent>
              </Card>
            </>
          )}

          {/* Privacy & Data - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Privacy & Data</span>
              </CardTitle>
              <CardDescription>
                Manage your privacy settings and data handling preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleGDPRSettings />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
