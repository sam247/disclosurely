
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import disclosurelyIcon from "@/assets/logos/disclosurely-icon.png";
import { useParams } from 'react-router-dom';

interface BrandedFormLayoutProps {
  title: string;
  description?: string;
  organizationName?: string;
  logoUrl?: string;
  brandColor?: string;
  subscriptionTier?: 'basic' | 'pro' | null;
  linkToken?: string;
  children: React.ReactNode;
}

const BrandedFormLayout = ({ 
  title, 
  description, 
  organizationName,
  logoUrl,
  brandColor = '#2563eb',
  subscriptionTier,
  linkToken,
  children 
}: BrandedFormLayoutProps) => {
  // Get linkToken from URL params if not provided
  const params = useParams<{ linkToken?: string }>();
  const token = linkToken || params.linkToken;
  
  // Determine the main secure page URL based on context
  // Use new form URLs instead of legacy token-based links
  const getMainSecurePageUrl = () => {
    // Check if we're on a custom domain (new form structure)
    const currentPath = window.location.pathname;
    
    // If we're on /newform, /report, /submit, or /whistleblow, return to /newform
    if (currentPath.includes('/newform') || 
        currentPath.includes('/report') || 
        currentPath.includes('/submit') || 
        currentPath.includes('/whistleblow')) {
      return '/newform';
    }
    
    // Fallback: try to detect custom domain and return /newform
    // Otherwise return /newform as default
    return '/newform';
  };
  
  // Dynamic page title: "{Company Name} Secure Reporting Portal"
  const pageTitle = organizationName 
    ? `${organizationName} Secure Reporting Portal`
    : 'Secure Reporting Portal';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description || "Submit your report securely and confidentially"} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Organization Branding - Matching CompanyStatusPage */}
      <header className="bg-white shadow-sm border-t-4 w-full" style={{ borderTopColor: brandColor }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4 max-w-7xl mx-auto">
            <div className="flex items-center min-w-0">
              <div className="flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                 {logoUrl ? (
                   <img
                     src={logoUrl}
                     alt={`${organizationName || 'Organization'} logo`}
                     className="w-10 h-10 sm:w-12 sm:h-12 object-contain cursor-pointer"
                     onClick={() => window.location.href = getMainSecurePageUrl()}
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       target.nextElementSibling?.classList.remove('hidden');
                     }}
                   />
                 ) : (
                   <img
                     src={disclosurelyIcon}
                     alt="Disclosurely logo"
                     className="w-10 h-10 sm:w-12 sm:h-12 object-contain cursor-pointer"
                     onClick={() => window.location.href = getMainSecurePageUrl()}
                   />
                 )}
                {logoUrl && (
                  <img
                    src={disclosurelyIcon}
                    alt="Disclosurely logo"
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain cursor-pointer hidden"
                    onClick={() => window.location.href = getMainSecurePageUrl()}
                  />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{organizationName || 'Organization'}</h1>
                <p className="text-xs sm:text-sm text-gray-600">Secure Report Submission</p>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* Main content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-4 sm:p-6">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default BrandedFormLayout;
