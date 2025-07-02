
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BrandedFormLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  organizationName?: string;
  logoUrl?: string;
  brandColor?: string;
  className?: string;
}

const BrandedFormLayout = ({
  title,
  description,
  children,
  organizationName,
  logoUrl,
  brandColor = '#2563eb',
  className = ''
}: BrandedFormLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Full-width Header */}
      <header className="bg-white shadow-sm border-t-4 w-full" style={{ borderTopColor: brandColor }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="flex items-center justify-center mr-4">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={`${organizationName || 'Organization'} logo`}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <img 
                  src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" 
                  alt="Disclosurely"
                  className={`h-10 w-auto object-contain ${logoUrl ? 'hidden' : ''}`}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {organizationName || 'Disclosurely'}
                </h1>
                <p className="text-sm text-gray-600">Secure Report Submission</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <img 
                src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" 
                alt="Disclosurely"
                className="h-6 w-auto"
                style={{ filter: `hue-rotate(${brandColor === '#2563eb' ? '0deg' : '180deg'})` }}
              />
              {title}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BrandedFormLayout;
