import OrganizationSettings from '@/components/OrganizationSettings';

const BrandingView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Custom Branding</h2>
        <p className="text-muted-foreground">Customize your organization's branding and appearance</p>
      </div>
      <OrganizationSettings />
    </div>
  );
};

export default BrandingView;
