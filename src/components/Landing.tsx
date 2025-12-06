import { useState } from "react";
import { Shield, CheckCircle, BarChart3, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Footer } from "@/components/ui/footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import BlogSection from "@/components/BlogSection";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { useTranslation } from "react-i18next";
import DynamicHelmet from "@/components/DynamicHelmet";
import TypingAnimation from "@/components/TypingAnimation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import anonymousReportingIcon from "@/assets/icons/anonymous_reporting.png";
import secureMessagingIcon from "@/assets/icons/secure_messaging.png";
import caseManagementIcon from "@/assets/icons/case_management.png";
import multiUserAccessIcon from "@/assets/icons/multi-user_access.png";
import regulatoryComplianceIcon from "@/assets/icons/regulatory_compliance.png";
import enterpriseSecurityIcon from "@/assets/icons/enterprise_security.png";
import anonymousReportingArtwork from "@/assets/artwork/anonymous_reporting_made_simple.png";
import militaryGradeEncryptionArtwork from "@/assets/artwork/military_grade_encryption.png";
import complianceMadeEasyArtwork from "@/assets/artwork/compliance_made_easy.png";
import secureTwoWayCommArtwork from "@/assets/artwork/secure_two_way_communication.png";
import aiPoweredCaseAnalysisArtwork from "@/assets/artwork/ai_powered_case_analysis.png";
import iso27001Badge from "/lovable-uploads/9762866a-d8d9-4860-bf30-3ffd178885a8.png";
import gdprBadge from "/lovable-uploads/70aa6ac0-c161-4167-921d-79f08f6f4b02.png";
import aicpaBadge from "/lovable-uploads/a9716d48-ff27-4193-b51c-9b035d1692b0.png";
// Business logos from /public/business_logos/
const businessLogos = [{
  src: "/business_logos/page-1.png",
  alt: "Business Partner 1"
}, {
  src: "/business_logos/page-2.png",
  alt: "Business Partner 2"
}, {
  src: "/business_logos/page-3.png",
  alt: "Business Partner 3"
}, {
  src: "/business_logos/page-4.png",
  alt: "Business Partner 4"
}, {
  src: "/business_logos/page-5.png",
  alt: "Business Partner 5"
}, {
  src: "/business_logos/page-6.png",
  alt: "Business Partner 6"
}];
const Landing = () => {
  const {
    t,
    i18n
  } = useTranslation();
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: 'tier1' | 'tier2') => {
    setLoading(tier);
    try {
      console.log('[Landing] Starting subscription for tier:', tier);
      
      // Check if user is logged in (optional - checkout works without auth)
      const { data: { session } } = await supabase.auth.getSession();
      
      const requestBody: any = {
        tier,
        employee_count: tier === 'tier1' ? '0-49' : '50+',
        interval: billingInterval,
      };

      // If not logged in, we'll let Stripe collect email during checkout
      // If logged in, include auth token
      const headers: any = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      console.log('[Landing] Invoking create-checkout with:', { tier, interval: billingInterval, hasAuth: !!session });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers,
        body: requestBody
      });

      if (error) {
        console.error('[Landing] Edge function error:', error);
        // Extract error message from error object
        const errorMsg = error?.message || error?.error || JSON.stringify(error);
        throw new Error(errorMsg);
      }

      console.log('[Landing] Checkout response:', data);

      // Check if response contains an error
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.url) {
        console.log('[Landing] Redirecting to checkout URL:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (error: any) {
      console.error('[Landing] Error creating checkout session:', error);
      // Extract error message from various possible formats
      let errorMessage = 'Failed to start subscription process. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.details) {
        errorMessage = `${error.message || 'Error'}: ${error.details}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(null);
    }
  };
  const currentLanguage = i18n.language;
  const langPrefix = currentLanguage && currentLanguage !== "en" ? `/${currentLanguage}` : "";
  return <>
          <DynamicHelmet pageIdentifier="/" fallbackTitle="Disclosurely | Whistleblowing Platform | Disclosure Management Software" fallbackDescription="Secure whistleblowing platform for organizations. Anonymous reporting, end-to-end encryption, and compliance features." fallbackImage="https://disclosurely.com/ogimage.png" />
      <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <AnnouncementBar />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" alt="Disclosurely" className="h-5 sm:h-6 md:h-8 w-auto" loading="eager" fetchPriority="high" />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <PublicLanguageSelector />
              <Link to={`${langPrefix}/pricing`} className="text-gray-700 hover:text-gray-900">
                {t("nav.pricing")}
              </Link>
              <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                {t("nav.getStarted")}
              </a>
            </div>
            <div className="md:hidden flex items-center gap-1.5">
              <PublicLanguageSelector />
              <Link to={`${langPrefix}/auth/login`} className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs whitespace-nowrap">
                {t("nav.signin")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-20 py-[50px]">
        <div className="text-center">
          {/* Security Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium text-xs">Military Grade AES-GCM Encryption</span>
            </div>
          </div>

          <h1 className="sm:text-5xl text-gray-900 mb-6 font-bold text-2xl md:text-5xl">
            {t("landing.hero.title1")}
            <span className="block text-blue-600">
              <TypingAnimation phrases={(() => {
                try {
                  const phrases = t("landing.hero.typingPhrases", {
                    returnObjects: true
                  });
                  // Debug: log what we get
                  // Typing phrases initialized
                  // Ensure we always have an array
                  if (Array.isArray(phrases) && phrases.length > 0) {
                    
                    return phrases;
                  }
                } catch (error) {
                  
                }
                // Fallback to English phrases if translation fails
                const fallback = ["AI-Powered Workflows", "Anonymous Reporting", "Real-Time Audit Trails", "Private AI Assistance", "Military-Grade Security", "Automated Risk Scoring", "Proactive Risk Detection", "Trust-First Technology"];
                
                return fallback;
              })()} typingSpeed={100} deletingSpeed={50} pauseDuration={2000} />
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto px-4">{t("landing.hero.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full sm:w-auto text-center">
                {t("landing.hero.startFreeTrial")}
              </a>
            <Link to={`${langPrefix}/pricing`} className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold w-full sm:w-auto text-center">
              {t("landing.hero.viewPricing")}
            </Link>
          </div>

          {/* Trusted by Section - moved to hero area */}
          <div className="mt-16 mb-8">
            <div className="text-center mb-12">
              <p className="text-lg font-medium text-gray-700">{t("landing.trusted")}</p>
            </div>

            {/* Logo Grid - Static Display */}
            <div className="flex flex-wrap justify-center items-center gap-8 max-w-5xl mx-auto">
              {businessLogos.map((logo, index) => <div key={index} className="flex-shrink-0">
                  <img src={logo.src} alt={logo.alt} loading="lazy" decoding="async" className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>)}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("landing.features.title")}</h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto px-4">{t("landing.features.subtitle")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={anonymousReportingIcon} alt="Anonymous Reporting" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">{t("landing.features.anonymousReporting.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("landing.features.anonymousReporting.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={secureMessagingIcon} alt="Secure Messaging" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">{t("landing.features.secureMessaging.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("landing.features.secureMessaging.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={caseManagementIcon} alt="Case Management" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">{t("landing.features.caseManagement.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("landing.features.caseManagement.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={multiUserAccessIcon} alt="Multi-User Access" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">{t("landing.features.multiUserAccess.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("landing.features.multiUserAccess.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={regulatoryComplianceIcon} alt="Regulatory Compliance" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  {t("landing.features.regulatoryCompliance.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("landing.features.regulatoryCompliance.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={enterpriseSecurityIcon} alt="Enterprise Security" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">{t("landing.features.enterpriseSecurity.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("landing.features.enterpriseSecurity.description")}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("landing.howItWorks.title")}</h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto px-4">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("landing.howItWorks.step1.title")}</h3>
              <p className="text-gray-700">{t("landing.howItWorks.step1.description")}</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("landing.howItWorks.step2.title")}</h3>
              <p className="text-gray-700">{t("landing.howItWorks.step2.description")}</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("landing.howItWorks.step3.title")}</h3>
              <p className="text-gray-600">{t("landing.howItWorks.step3.description")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anonymous Reporting Made Simple */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t("landing.anonymousReporting.title")}
              </h2>
              <p className="text-lg text-gray-600 mb-6">{t("landing.anonymousReporting.description")}</p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.anonymousReporting.benefit1")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.anonymousReporting.benefit2")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.anonymousReporting.benefit3")}</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={anonymousReportingArtwork} alt="Anonymous Reporting Made Simple" loading="lazy" decoding="async" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Military-Grade Encryption */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={militaryGradeEncryptionArtwork} alt="Military-Grade Encryption" loading="lazy" decoding="async" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t("landing.encryption.title")}</h2>
              <p className="text-lg text-gray-600 mb-6">{t("landing.encryption.description")}</p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.encryption.benefit1")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.encryption.benefit2")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.encryption.benefit3")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Made Easy */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t("landing.compliance.title")}</h2>
              <p className="text-lg text-gray-600 mb-6">{t("landing.compliance.description")}</p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.compliance.benefit1")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.compliance.benefit2")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.compliance.benefit3")}</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={complianceMadeEasyArtwork} alt="Compliance Made Easy" loading="lazy" decoding="async" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Two-Way Communication */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={secureTwoWayCommArtwork} alt="Secure Two-Way Communication" loading="lazy" decoding="async" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t("landing.messaging.title")}</h2>
              <p className="text-lg text-gray-600 mb-6">{t("landing.messaging.description")}</p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.messaging.benefit1")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.messaging.benefit2")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.messaging.benefit3")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Case Analysis */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t("landing.aiPowered.title")}</h2>
              <p className="text-lg text-gray-600 mb-6">{t("landing.aiPowered.description")}</p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.aiPowered.benefit1")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.aiPowered.benefit2")}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>{t("landing.aiPowered.benefit3")}</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={aiPoweredCaseAnalysisArtwork} alt="AI-Powered Case Analysis" loading="lazy" decoding="async" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Branding Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-80 flex items-center justify-center rounded-lg">
                <img src="/custom_branding.jpeg" alt="Custom Branding" loading="lazy" decoding="async" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Custom Branding</h2>
              <p className="text-lg text-gray-600 mb-6">With our custom domain support, logo integration and branded portals, your reporting submission system looks and feels like a native part of your infrastructure.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>Custom CNAME support for branded secure links</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>Your logo and branding on all submission portals</span>
                </li>
                
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>White-label options for complete brand control</span>
                </li>
              </ul>
              
            </div>
          </div>
        </div>
      </div>

      {/* View Full Features Button */}
      <div className="bg-white py-8">
        
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("landing.pricing.title")}</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">{t("landing.pricing.subtitle")}</p>
          </div>

          {/* Billing Interval Tabs */}
          <div className="flex justify-center mb-8">
            <Tabs value={billingInterval} onValueChange={(v) => setBillingInterval(v as 'monthly' | 'annual')} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly" className="text-sm sm:text-base">Monthly</TabsTrigger>
                <TabsTrigger value="annual" className="text-sm sm:text-base">
                  Annual
                  <Badge className="ml-2 bg-green-600 text-white text-[10px] px-1.5 py-0">Save 17%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">{t("pricing.plans.starter.name")}</CardTitle>
                <div className="mt-4">
                  {billingInterval === 'monthly' ? (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold">£19.99</span>
                      <span className="text-gray-600 text-sm sm:text-base">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold">£199.90</span>
                      <span className="text-gray-600 text-sm sm:text-base">/year</span>
                    </>
                  )}
                </div>
                <CardDescription className="text-sm sm:text-base">
                  {t("pricing.plans.starter.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.unlimitedCases")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.unlimitedStorage")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.emailSupport")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">{t("pricing.features.messaging")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">{t("pricing.features.aiHelper")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">{t("pricing.features.customBranding")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">{t("pricing.features.cname")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">{t("pricing.features.workflows")}</span>
                  </div>
                </div>
                <Button 
                  type="button"
                  className="w-full mt-6" 
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubscribe('tier1');
                  }}
                  disabled={loading === 'tier1'}
                >
                  {loading === 'tier1' ? 'Loading...' : t("pricing.cta.startTrial")}
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-blue-200 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {t("pricing.plans.mostPopular")}
                </span>
              </div>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">{t("pricing.plans.pro.name")}</CardTitle>
                <div className="mt-4">
                  {billingInterval === 'monthly' ? (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold">£39.99</span>
                      <span className="text-gray-600 text-sm sm:text-base">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold">£399.90</span>
                      <span className="text-gray-600 text-sm sm:text-base">/year</span>
                    </>
                  )}
                </div>
                <CardDescription className="text-sm sm:text-base">{t("pricing.plans.pro.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.unlimitedCases")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.unlimitedStorage")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.emailSupport")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.messaging")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.aiHelper")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.customBranding")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.cname")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.workflows")}</span>
                  </div>
                </div>
                <Button 
                  type="button"
                  className="w-full mt-6" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubscribe('tier2');
                  }}
                  disabled={loading === 'tier2'}
                >
                  {loading === 'tier2' ? 'Loading...' : t("pricing.cta.startTrial")}
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">{t("pricing.plans.enterprise.name")}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">{t("pricing.plans.enterprise.price")}</span>
                </div>
                <CardDescription className="text-sm sm:text-base">
                  {t("pricing.plans.enterprise.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.everythingPro")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.teamManagement")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Multiple custom domains</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.dedicatedSupport")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.slaGuarantee")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.customIntegrations")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.api")}</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  <a href="https://disclosurely.com/contact">{t("pricing.cta.contactSales")}</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("landing.testimonials.title")}</h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">{t("landing.testimonials.subtitle")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">
                      ★
                    </span>)}
                </div>
                <p className="text-gray-600 mb-4">{t("landing.testimonials.testimonial1.quote")}</p>
                <div className="font-medium text-gray-900">{t("landing.testimonials.testimonial1.name")}</div>
                <div className="text-sm text-gray-500">{t("landing.testimonials.testimonial1.role")}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">
                      ★
                    </span>)}
                </div>
                <p className="text-gray-600 mb-4">{t("landing.testimonials.testimonial2.quote")}</p>
                <div className="font-medium text-gray-900">{t("landing.testimonials.testimonial2.name")}</div>
                <div className="text-sm text-gray-500">{t("landing.testimonials.testimonial2.role")}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">
                      ★
                    </span>)}
                </div>
                <p className="text-gray-600 mb-4">{t("landing.testimonials.testimonial3.quote")}</p>
                <div className="font-medium text-gray-900">{t("landing.testimonials.testimonial3.name")}</div>
                <div className="text-sm text-gray-500">{t("landing.testimonials.testimonial3.role")}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              {t("landing.certifications.title")}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              {t("landing.certifications.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <img src="/lovable-uploads/9762866a-d8d9-4860-bf30-3ffd178885a8.png" alt="ISO 27001 Certification" loading="lazy" decoding="async" className="h-16 w-16 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">ISO 27001</h3>
                <p className="text-sm text-gray-600">Information Security Management</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <img src="/lovable-uploads/70aa6ac0-c161-4167-921d-79f08f6f4b02.png" alt="GDPR Compliant" loading="lazy" decoding="async" className="h-16 w-16 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">GDPR</h3>
                <p className="text-sm text-gray-600">Data Protection Compliance</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <img src="/lovable-uploads/a9716d48-ff27-4193-b51c-9b035d1692b0.png" alt="AICPA SOC" loading="lazy" decoding="async" className="h-16 w-16 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">AICPA SOC</h3>
                <p className="text-sm text-gray-600">Service Organization Controls</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <BlogSection />

      {/* FAQ Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("landing.faq.title")}</h2>
            <p className="text-lg text-gray-600">{t("landing.faq.subtitle")}</p>
          </div>

          <Accordion type="single" collapsible defaultValue="item-1" className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("landing.faq.question1.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">{t("landing.faq.question1.answer")}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("landing.faq.question2.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">{t("landing.faq.question2.answer")}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("landing.faq.question3.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">{t("landing.faq.question3.answer")}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("landing.faq.question4.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">{t("landing.faq.question4.answer")}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("landing.faq.question5.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">{t("landing.faq.question5.answer")}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("landing.faq.question6.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">{t("landing.faq.question6.answer")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t("landing.cta.title")}</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">{t("landing.cta.description")}</p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            {t("landing.cta.button")}
          </a>
        </div>
      </div>

      <CookieConsentBanner />
      <Footer />
      </div>
    </>;
};
export default Landing;