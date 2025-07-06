
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="min-h-screen bg-gray-50">
      {/* White header section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            {logoUrl && (
              <div className="mb-4">
                <img 
                  src={logoUrl} 
                  alt={organizationName || 'Organization'} 
                  className="h-16 mx-auto object-contain"
                />
              </div>
            )}
            
            {organizationName && (
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {organizationName}
              </h1>
            )}
            
            <h2 className="text-xl font-semibold mb-2" style={{ color: brandColor }}>
              {title}
            </h2>
            
            {description && (
              <p className="text-gray-600">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

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
