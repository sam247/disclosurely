
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Shield } from 'lucide-react';
import disclosurelyIcon from "@/assets/logos/disclosurely-icon.png";
import { useParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Open drawer on mobile after initial render
  useEffect(() => {
    if (isMobile) {
      // Small delay to ensure smooth animation
      setTimeout(() => setDrawerOpen(true), 100);
    }
  }, [isMobile]);
  
  // Determine the main secure page URL based on context
  // Use new form URLs instead of legacy token-based links
  const getMainSecurePageUrl = () => {
    // Always return the clean /report URL for the main form
    // This provides a consistent UX regardless of how the user accessed the form
    // /report, /submit, /whistleblow all route to the same form
    return '/report';
  };
  
  // Dynamic page title: "{Company Name} Secure Reporting Portal"
  const pageTitle = organizationName 
    ? `${organizationName} Secure Reporting Portal`
    : 'Secure Reporting Portal';

  // On mobile, use Drawer for form content
  if (isMobile) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={description || "Submit your report securely and confidentially"} />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Header with Organization Branding - Always visible */}
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

          {/* Drawer for form content on mobile */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="max-h-[calc(100vh-80px)] mt-[80px]">
              <div className="px-4 pt-4 pb-6 overflow-y-auto">
                {children}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </>
    );
  }

  // Desktop: use regular layout
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
