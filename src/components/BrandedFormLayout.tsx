
import { ReactNode } from 'react';
import { Shield } from 'lucide-react';
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
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-t-4" style={{ borderTopColor: brandColor }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center justify-center mr-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${organizationName || 'Organization'} logo`}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div 
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}
                style={{ backgroundColor: brandColor }}
              >
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{organizationName || 'Disclosurely'}</h1>
              <p className="text-xs text-gray-600">Secure Report Submission</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" style={{ color: brandColor }} />
              {title}
            </CardTitle>
            <CardDescription className="text-sm">
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
