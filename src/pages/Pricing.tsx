import { useState } from "react";
import { CheckCircle, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Footer } from "@/components/ui/footer";
import { StandardHeader } from "@/components/StandardHeader";
import DynamicHelmet from "@/components/DynamicHelmet";
import { useLanguageFromUrl } from "@/hooks/useLanguageFromUrl";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
const Pricing = () => {
  const {
    currentLanguage
  } = useLanguageFromUrl();
  const {
    t
  } = useTranslation();
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const langPrefix = currentLanguage && currentLanguage !== "en" ? `/${currentLanguage}` : "";

  // Get referral code from URL params
  const getReferralCode = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || params.get('referral');
  };

  const handleSubscribe = async (tier: 'tier1' | 'tier2') => {
    setLoading(tier);
    try {
      console.log('[Pricing] Starting subscription for tier:', tier);
      
      // Check if user is logged in (optional - checkout works without auth)
      const { data: { session } } = await supabase.auth.getSession();
      
      const referralCode = getReferralCode();
      
      const requestBody: any = {
        tier,
        employee_count: tier === 'tier1' ? '0-49' : '50+',
        interval: billingInterval,
      };

      // Add referral code if present
      if (referralCode) {
        requestBody.referral_code = referralCode;
      }

      // If not logged in, we'll let Stripe collect email during checkout
      // If logged in, include auth token
      const headers: any = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      console.log('[Pricing] Invoking create-checkout with:', { tier, interval: billingInterval, hasAuth: !!session });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers,
        body: requestBody
      });

      if (error) {
        // Try to extract error message from various sources
        let errorMsg = error?.message || 'Unknown error';
        
        // Try to read the response body if context is a Response object
        if (error?.context instanceof Response) {
          try {
            const responseText = await error.context.text();
            try {
              const responseJson = JSON.parse(responseText);
              if (responseJson.error) {
                errorMsg = responseJson.error;
              }
            } catch (e) {
              // Not JSON, use text as is
              if (responseText) {
                errorMsg = responseText;
              }
            }
          } catch (e) {
            console.error('[Pricing] Could not read error response body:', e);
          }
        }
        
        // If error has context, try to parse it
        if (error?.context && typeof error.context === 'object' && !(error.context instanceof Response)) {
          const contextError = error.context as any;
          if (contextError?.error) {
            errorMsg = contextError.error;
          } else if (contextError?.message) {
            errorMsg = contextError.message;
          }
        }
        
        // If error message is generic, try to get more details
        if (errorMsg === 'Edge Function returned a non-2xx status code' && data) {
          // Sometimes the error response is in data even when error is set
          if (data.error) {
            errorMsg = data.error;
          }
        }
        
        throw new Error(errorMsg);
      }

      // Check if response contains an error
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.url) {
        console.log('[Pricing] Redirecting to checkout URL:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (error: any) {
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
  return <>
      <DynamicHelmet pageIdentifier="pricing" fallbackTitle={t("pricing.meta.title")} fallbackDescription={t("pricing.meta.description")} />
      
      <div className="min-h-screen bg-white">
        <StandardHeader currentLanguage={currentLanguage} />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">Transparent Pricing Built For Business.</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Start Free. Get Secure Whistleblowing.
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                7-day free trial • Unlimited reports included
              </p>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                All plans include military-grade encryption, GDPR compliance, and real-time analytics. Choose the plan that matches your compliance needs and scale as you grow.
              </p>
            </div>
          </div>
        </section>

      {/* Trust Indicators */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base sm:text-lg">7-Day Money-Back Guarantee</div>
                <div className="text-xs sm:text-sm text-gray-600">Try risk-free, cancel anytime</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base sm:text-lg">Trusted by UK Businesses</div>
                <div className="text-xs sm:text-sm text-gray-600">ISO 27001, GDPR, SOX compliant</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base sm:text-lg">Enterprise-Grade Security</div>
                <div className="text-xs sm:text-sm text-gray-600">ISO 27001, SOC 2 Type II, GDPR compliant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {/* Starter Plan */}
            <Card className="relative">
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

            {/* Pro Plan */}
            <Card className="relative border-blue-200 shadow-lg">
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

            {/* Enterprise Plan */}
            <Card className="relative sm:col-span-2 lg:col-span-1">
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

      {/* Trust Indicators */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-gray-900">7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-gray-900">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Testimonial */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-6xl font-bold text-blue-600 mb-4 leading-none">"</div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Disclosurely has transformed how we handle sensitive reports. The platform is intuitive, secure, and our employees feel confident reporting issues. Implementation was seamless and the support team was excellent.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                  SJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-600">Chief Compliance Officer</div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Why Organizations Choose Disclosurely</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold mb-1">35% Faster Resolution</div>
                    <div className="text-blue-100 text-sm">AI-powered case analysis speeds up investigations</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold mb-1">100% Compliance Ready</div>
                    <div className="text-blue-100 text-sm">ISO 27001, GDPR, SOX compliant out of the box</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold mb-1">Enterprise-Grade Security</div>
                    <div className="text-blue-100 text-sm">Military-grade encryption and tamper-evident audit logs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Enterprise-grade security for every team
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Your data is protected with industry-leading security standards and compliance certifications.
              </p>
              <Button variant="outline" size="lg" className="border-gray-300">
                Learn more about security
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Zero data retention by third-party LLMs</div>
                  <div className="text-sm text-gray-600">Your data never leaves our secure infrastructure</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Private AI model</div>
                  <div className="text-sm text-gray-600">Dedicated AI processing for enhanced privacy</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">SOC 2 Type II & GDPR Ready</div>
                  <div className="text-sm text-gray-600">Certified compliance with industry standards</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Data encryption in transit and at rest</div>
                  <div className="text-sm text-gray-600">AES-256 encryption for maximum protection</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Role-based access control</div>
                  <div className="text-sm text-gray-600">Granular permissions for team members</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">SAML-based SSO & SCIM provisioning</div>
                  <div className="text-sm text-gray-600">Enterprise identity management integration</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">IP Whitelisting</div>
                  <div className="text-sm text-gray-600">Restrict access to approved IP addresses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
            <p className="text-lg text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Pro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">Reporting</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Reports per Month</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Unlimited</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">Storage per Report</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Unlimited</td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">Security & Compliance</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Military-Grade Encryption (AES-GCM)</td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">GDPR Compliant</td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Audit Trail</td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">AI Features</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">AI Case Analysis (DeepSeek)</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">AI Risk Assessment</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">AI Chat Support</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">Communication</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Two-Way Messaging</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">Anonymous Report Submission</td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">Team & Collaboration</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Team Members</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">5</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">20</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Unlimited</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">Automated Assignment Rules</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">SLA Management</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">Customization</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Custom Branding</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">Custom Domain (CNAME)</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">1 domain</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 font-semibold">Multiple domains</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Real-time Analytics Dashboard</td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">Support</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Email Support</td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">Priority Support</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Dedicated Account Manager</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-gray-50 bg-white">
                  <td className="px-6 py-4 text-sm text-gray-900">SLA Guarantee</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("pricing.faq.title")}</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("pricing.faq.trial.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                {t("pricing.faq.trial.answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("pricing.faq.limit.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                {t("pricing.faq.limit.answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("pricing.faq.change.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                {t("pricing.faq.change.answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {t("pricing.faq.security.question")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                {t("pricing.faq.security.answer")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t("pricing.cta.ready")}</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">{t("pricing.cta.join")}</p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            {t("pricing.cta.startTrial")}
          </a>
        </div>
      </div>

      {/* Related Pages */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Explore More</h2>
            <p className="text-gray-600">Learn more about our platform and solutions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link to={`${langPrefix}/features`} className="block group">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Platform Features</h3>
                <p className="text-gray-600 text-sm">
                  Explore all features included in your plan - anonymous reporting, AI case analysis, and secure messaging.
                </p>
              </div>
            </Link>

            <Link to={`${langPrefix}/compliance-software`} className="block group">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Compliance Software</h3>
                <p className="text-gray-600 text-sm">
                  Discover how our compliance software helps you meet GDPR, ISO 27001, and EU Directive requirements.
                </p>
              </div>
            </Link>

            <Link to={`${langPrefix}/vs-speakup`} className="block group">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Compare Solutions</h3>
                <p className="text-gray-600 text-sm">
                  See how Disclosurely compares to other whistleblowing platforms like SpeakUp and competitors.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>;
};
export default Pricing;