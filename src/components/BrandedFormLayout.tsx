
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface BrandedFormLayoutProps {
  title: string;
  description?: string;
  organizationName?: string;
  logoUrl?: string;
  brandColor?: string;
  children: React.ReactNode;
}

const BrandedFormLayout = ({ 
  title, 
  description, 
  organizationName,
  logoUrl,
  brandColor = '#2563eb',
  children 
}: BrandedFormLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Organization Branding - Matching CompanyStatusPage */}
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
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                )}
                {logoUrl && (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center hidden"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{organizationName || 'Organization'}</h1>
                <p className="text-sm text-gray-600">Secure Report Submission</p>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandedFormLayout;
