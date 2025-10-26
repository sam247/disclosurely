import { CheckCircle, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Footer } from "@/components/ui/footer";
import { StandardHeader } from "@/components/StandardHeader";
import DynamicHelmet from "@/components/DynamicHelmet";
import { useLanguageFromUrl } from "@/hooks/useLanguageFromUrl";
import { useTranslation } from "react-i18next";

const Pricing = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const { t } = useTranslation();
  const langPrefix = currentLanguage && currentLanguage !== "en" ? `/${currentLanguage}` : "";

  return (
    <>
      <DynamicHelmet
        pageIdentifier="pricing"
        fallbackTitle={t("pricing.meta.title")}
        fallbackDescription={t("pricing.meta.description")}
      />
      
      <div className="min-h-screen bg-white">
        <StandardHeader currentLanguage={currentLanguage} />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
                {t("pricing.hero.subtitle") || 'Transparent Pricing'}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {t("pricing.hero.title") || 'Simple, Transparent Pricing'}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Choose the perfect plan for your organization. All plans include a 14-day free trial with no credit card required.
              </p>
            </div>
          </div>
        </section>

      {/* Comparison Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Disclosurely?
            </h2>
            <p className="text-lg text-gray-600">
              Better pricing and AI-powered case analysis
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Disclosurely Pro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Competitor</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-900">Monthly Price</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-2xl font-bold text-blue-600">£350</span>
                    <span className="text-sm text-gray-600">/month</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">£500+</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-semibold">AI Case Analysis</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-900">Unlimited Reports</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">Military-Grade Encryption</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-900">GDPR Compliance</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">AI Risk Assessment</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-900">Real-time Analytics</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">Custom Branding</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-gray-400 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-6 py-3 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900 font-semibold">
                AI Case Analysis - Exclusive to Disclosurely
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">{t("pricing.plans.starter.name")}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">{t("pricing.plans.starter.price")}</span>
                  <span className="text-gray-600 text-sm sm:text-base">{t("pricing.plans.perMonth")}</span>
                </div>
                <CardDescription className="text-sm sm:text-base">
                  {t("pricing.plans.starter.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.casesLimit")}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.storage")}</span>
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
                </div>
                <Button className="w-full mt-6" asChild>
                  <a href="https://app.disclosurely.com/auth/signup">{t("pricing.cta.startTrial")}</a>
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
                  <span className="text-3xl sm:text-4xl font-bold">{t("pricing.plans.pro.price")}</span>
                  <span className="text-gray-600 text-sm sm:text-base">{t("pricing.plans.perMonth")}</span>
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
                </div>
                <Button className="w-full mt-6" asChild>
                  <a href="https://app.disclosurely.com/auth/signup">{t("pricing.cta.startTrial")}</a>
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
                    <span className="text-gray-700 text-sm sm:text-base">{t("pricing.features.customDomain")}</span>
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
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">
                      {t("pricing.features.customIntegrations")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-grey-600" />
                    <span className="text-gray-500 text-sm sm:text-base">{t("pricing.features.api")}</span>
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

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("pricing.faq.title")}</h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("pricing.faq.trial.question")}</h3>
              <p className="text-gray-600">{t("pricing.faq.trial.answer")}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("pricing.faq.limit.question")}</h3>
              <p className="text-gray-600">{t("pricing.faq.limit.answer")}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("pricing.faq.change.question")}</h3>
              <p className="text-gray-600">{t("pricing.faq.change.answer")}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("pricing.faq.security.question")}</h3>
              <p className="text-gray-600">{t("pricing.faq.security.answer")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t("pricing.cta.ready")}</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">{t("pricing.cta.join")}</p>
          <a
            href="https://app.disclosurely.com/auth/signup"
            className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block"
          >
            {t("pricing.cta.startTrial")}
          </a>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default Pricing;
