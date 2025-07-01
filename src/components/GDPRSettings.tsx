
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GDPRCompliance from './GDPRCompliance';
import PrivacyPolicyGenerator from './PrivacyPolicyGenerator';
import CookieConsent from './CookieConsent';
import { useOrganization } from '@/hooks/useOrganization';

const GDPRSettings = () => {
  const { organization } = useOrganization();

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">GDPR Compliance</TabsTrigger>
          <TabsTrigger value="privacy-policy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="cookie-consent">Cookie Consent</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance">
          <GDPRCompliance />
        </TabsContent>

        <TabsContent value="privacy-policy">
          <PrivacyPolicyGenerator />
        </TabsContent>

        <TabsContent value="cookie-consent">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cookie Consent Management</h3>
            <p className="text-gray-600">
              The cookie consent banner will appear automatically for new visitors. 
              Here's a preview of how it works:
            </p>
            <CookieConsent organizationId={organization.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GDPRSettings;
