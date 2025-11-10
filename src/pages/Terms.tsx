import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import DynamicHelmet from "@/components/DynamicHelmet";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { useLanguageFromUrl } from "@/hooks/useLanguageFromUrl";
import { useTranslation } from "react-i18next";

const Terms = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const { t } = useTranslation();
  const langPrefix = currentLanguage && currentLanguage !== "en" ? `/${currentLanguage}` : "";

  return (
    <>
      <DynamicHelmet
        pageIdentifier="terms"
        fallbackTitle={t("terms.meta.title")}
        fallbackDescription={t("terms.meta.description")}
      />

      <div className="min-h-screen bg-white">
        {/* Announcement Bar */}
        <AnnouncementBar />
        
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3">
                  <img
                    src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png"
                    alt="Disclosurely"
                    loading="lazy"
                    decoding="async"
                    className="h-6 md:h-8 w-auto"
                  />
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <PublicLanguageSelector />
                <Link to={`${langPrefix}/pricing`} className="text-gray-600 hover:text-gray-900">
                  {t("nav.pricing")}
                </Link>
                <Link
                  to={`${langPrefix}/auth/signup`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("nav.getStarted")}
                </Link>
              </div>
              <div className="md:hidden">
                <Link
                  to={`${langPrefix}/auth/login`}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {t("nav.signin")}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t("terms.hero.title")}</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("terms.hero.description")}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="prose prose-gray max-w-none space-y-8">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.introduction.title")}</h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.introduction.content")}</p>
            </section>

            {/* 2. Definitions */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.definitions.title")}</h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.definitions.content")}</p>
            </section>

            {/* 3. Service Description */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.serviceDescription.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.serviceDescription.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.serviceDescription.content2")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.serviceDescription.content3")}</p>
            </section>

            {/* 4. Registration */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.registration.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.registration.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.registration.content2")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.registration.content3")}</p>
            </section>

            {/* 5. Subscription and Payment */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.subscriptionPayment.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.subscriptionPayment.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.subscriptionPayment.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.subscriptionPayment.content3")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.subscriptionPayment.content4")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.subscriptionPayment.content5")}</p>
            </section>

            {/* 6. Data Processing */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.dataProcessing.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.dataProcessing.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.dataProcessing.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.dataProcessing.content3")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.dataProcessing.content4")}</p>
            </section>

            {/* 7. Customer Obligations */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.customerObligations.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.customerObligations.content1")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.customerObligations.content2")}</p>
            </section>

            {/* 8. Acceptable Use */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.acceptableUse.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.acceptableUse.content1")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.acceptableUse.content2")}</p>
            </section>

            {/* 9. Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.intellectualProperty.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.intellectualProperty.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.intellectualProperty.content2")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.intellectualProperty.content3")}</p>
            </section>

            {/* 10. Warranties */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.warranties.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.warranties.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2 font-semibold">{t("terms.sections.warranties.content2")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.warranties.content3")}</p>
            </section>

            {/* 11. Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.limitationOfLiability.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2 font-semibold">{t("terms.sections.limitationOfLiability.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2 font-semibold">{t("terms.sections.limitationOfLiability.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.limitationOfLiability.content3")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.limitationOfLiability.content4")}</p>
            </section>

            {/* 12. Termination */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.termination.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.termination.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.termination.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.termination.content3")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.termination.content4")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.termination.content5")}</p>
            </section>

            {/* 13. Confidentiality */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.confidentiality.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.confidentiality.content1")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.confidentiality.content2")}</p>
            </section>

            {/* 14. Compliance */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.compliance.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.compliance.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.compliance.content2")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.compliance.content3")}</p>
            </section>

            {/* 15. Modifications */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.modifications.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.modifications.content1")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.modifications.content2")}</p>
            </section>

            {/* 16. Dispute Resolution */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.disputeResolution.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.disputeResolution.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.disputeResolution.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.disputeResolution.content3")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.disputeResolution.content4")}</p>
            </section>

            {/* 17. General Provisions */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.generalProvisions.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.generalProvisions.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.generalProvisions.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.generalProvisions.content3")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.generalProvisions.content4")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.generalProvisions.content5")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.generalProvisions.content6")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("terms.sections.generalProvisions.content7")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.generalProvisions.content8")}</p>
            </section>

            {/* 18. Contact */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.contact.title")}</h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.sections.contact.content")}</p>
            </section>

            <div className="pt-8 text-center text-sm text-gray-500">
              <p>{t("terms.lastUpdated")}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Terms;
