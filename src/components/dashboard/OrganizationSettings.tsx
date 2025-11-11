import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Users, CreditCard, Globe, Shield } from 'lucide-react';
import ProfileSettings from '@/components/ProfileSettings';
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
          Manage your profile, organization, team, subscription, and privacy settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <div className="px-4 md:px-6">
          <TabsList className={`grid w-full h-auto bg-muted/50 ${isOrgAdmin ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-2'}`}>
            <TabsTrigger 
              value="profile" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Prof.</span>
            </TabsTrigger>
            
            {isOrgAdmin && (
              <>
                <TabsTrigger 
                  value="organization" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-background"
                >
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Organization</span>
                  <span className="sm:hidden">Org.</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="team" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-background"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Team</span>
                  <span className="sm:hidden">Team</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="subscription" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-background"
                >
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Subscription</span>
                  <span className="sm:hidden">Sub.</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="domains" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-background"
                >
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Domains</span>
                  <span className="sm:hidden">Dom.</span>
                </TabsTrigger>
              </>
            )}
            
            <TabsTrigger 
              value="privacy" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Privacy</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="mt-4 md:mt-6 px-4 md:px-6 pb-4 md:pb-6">
          <TabsContent value="profile" className="mt-0 space-y-4 md:space-y-6">
            <ProfileSettings />
          </TabsContent>

          {isOrgAdmin && (
            <>
              <TabsContent value="organization" className="mt-0 space-y-4 md:space-y-6">
                <OrganizationSettingsBranding />
              </TabsContent>

              <TabsContent value="team" className="mt-0 space-y-4 md:space-y-6">
                <UserManagement />
              </TabsContent>

              <TabsContent value="subscription" className="mt-0 space-y-4 md:space-y-6">
                <SubscriptionManagement />
              </TabsContent>

              <TabsContent value="domains" className="mt-0 space-y-4 md:space-y-6">
                <CustomDomainSettings />
              </TabsContent>
            </>
          )}

          <TabsContent value="privacy" className="mt-0 space-y-4 md:space-y-6">
            <SimpleGDPRSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default OrganizationSettings;
