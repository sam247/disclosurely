import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import DynamicHelmet from "@/components/DynamicHelmet";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { useLanguageFromUrl } from "@/hooks/useLanguageFromUrl";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const { t } = useTranslation();
  const langPrefix = currentLanguage && currentLanguage !== "en" ? `/${currentLanguage}` : "";

  return (
    <>
      <DynamicHelmet
        pageIdentifier="privacy"
        fallbackTitle={t("privacy.meta.title")}
        fallbackDescription={t("privacy.meta.description")}
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t("privacy.hero.title")}</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("privacy.hero.description")}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="prose prose-gray max-w-none space-y-8">
            {/* Info Box */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>{t("privacy.info.effectiveDate.label")}</strong> {t("privacy.info.effectiveDate.value")}
                </p>
                <p>
                  <strong>{t("privacy.info.company.label")}</strong> {t("privacy.info.company.value")}
                </p>
                <p>
                  <strong>{t("privacy.info.website.label")}</strong>{" "}
                  <a href="https://disclosurely.com" className="text-blue-600 hover:text-blue-800">
                    https://disclosurely.com
                  </a>
                </p>
                <p>
                  <strong>{t("privacy.info.contact.label")}</strong>{" "}
                  <a href="mailto:privacy@disclosurely.com" className="text-blue-600 hover:text-blue-800">
                    privacy@disclosurely.com
                  </a>
                </p>
                <p>
                  <strong>{t("privacy.info.office.label")}</strong> {t("privacy.info.office.value")}
                </p>
              </div>
            </div>

            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.introduction.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.introduction.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.introduction.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.introduction.content3")}</p>
              <p className="text-gray-700 leading-relaxed">{t("privacy.sections.introduction.content4")}</p>
            </section>

            {/* 2. Data Controller */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.dataController.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.dataController.content1")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.dataController.content2")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.dataController.content3")}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.dataController.content4")}</p>
              <p className="text-gray-700 leading-relaxed">{t("privacy.sections.dataController.content5")}</p>
            </section>

            {/* 3. Personal Data Collected - Complex nested structure */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.personalData.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("privacy.sections.personalData.content1")}</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t("privacy.sections.personalData.subsections.customer.title")}</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>{t("privacy.sections.personalData.subsections.customer.items.1")}</li>
                    <li>{t("privacy.sections.personalData.subsections.customer.items.2")}</li>
                    <li>{t("privacy.sections.personalData.subsections.customer.items.3")}</li>
                    <li>{t("privacy.sections.personalData.subsections.customer.items.4")}</li>
                    <li>{t("privacy.sections.personalData.subsections.customer.items.5")}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t("privacy.sections.personalData.subsections.whistleblower.title")}</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.1")}</li>
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.2")}</li>
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.3")}</li>
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.4")}</li>
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.5")}</li>
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.6")}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t("privacy.sections.personalData.subsections.technical.title")}</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>{t("privacy.sections.personalData.subsections.technical.items.1")}</li>
                    <li>{t("privacy.sections.personalData.subsections.technical.items.2")}</li>
                    <li>{t("privacy.sections.personalData.subsections.technical.items.3")}</li>
                    <li>{t("privacy.sections.personalData.subsections.technical.items.4")}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t("privacy.sections.personalData.subsections.marketing.title")}</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>{t("privacy.sections.personalData.subsections.marketing.items.1")}</li>
                    <li>{t("privacy.sections.personalData.subsections.marketing.items.2")}</li>
                    <li>{t("privacy.sections.personalData.subsections.marketing.items.3")}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Usage */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.usage.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.usage.content1")}</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <li key={num}>{t(`privacy.sections.usage.items.${num}`)}</li>
                ))}
              </ul>
            </section>

            {/* 5. Legal Bases - Complex structure */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.legalBases.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("privacy.sections.legalBases.content1")}</p>
              <div className="space-y-2 text-gray-700">
                <p><strong>{t("privacy.sections.legalBases.items.contractual.label")}</strong> {t("privacy.sections.legalBases.items.contractual.content")}</p>
                <p><strong>{t("privacy.sections.legalBases.items.legitimate.label")}</strong> {t("privacy.sections.legalBases.items.legitimate.content")}</p>
                <p><strong>{t("privacy.sections.legalBases.items.legal.label")}</strong> {t("privacy.sections.legalBases.items.legal.content")}</p>
                <p><strong>{t("privacy.sections.legalBases.items.consent.label")}</strong> {t("privacy.sections.legalBases.items.consent.content")}</p>
                <p><strong>{t("privacy.sections.legalBases.items.vitalInterests.label")}</strong> {t("privacy.sections.legalBases.items.vitalInterests.content")}</p>
                <p><strong>{t("privacy.sections.legalBases.items.publicInterest.label")}</strong> {t("privacy.sections.legalBases.items.publicInterest.content")}</p>
                <p><strong>{t("privacy.sections.legalBases.items.whistleblowing.label")}</strong> {t("privacy.sections.legalBases.items.whistleblowing.content")}</p>
              </div>
            </section>

            {/* 6. Data Hosting */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.dataHosting.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.dataHosting.content1")}</p>
                <p>{t("privacy.sections.dataHosting.content2")}</p>
                <p>{t("privacy.sections.dataHosting.content3")}</p>
                <p>{t("privacy.sections.dataHosting.content4")}</p>
              </div>
            </section>

            {/* 7. Data Retention */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.dataRetention.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.dataRetention.content1")}</p>
                <p>{t("privacy.sections.dataRetention.content2")}</p>
                <p>{t("privacy.sections.dataRetention.content3")}</p>
                <p>{t("privacy.sections.dataRetention.content4")}</p>
                <p>{t("privacy.sections.dataRetention.content5")}</p>
                <p>{t("privacy.sections.dataRetention.content6")}</p>
                <p>{t("privacy.sections.dataRetention.content7")}</p>
              </div>
            </section>

            {/* 8. Disclosure */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.disclosure.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.disclosure.content1")}</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <li key={num}>{t(`privacy.sections.disclosure.items.${num}`)}</li>
                ))}
              </ul>
            </section>

            {/* 9. Security */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.security.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.security.content1")}</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <li key={num}>{t(`privacy.sections.security.items.${num}`)}</li>
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">{t("privacy.sections.security.content2")}</p>
            </section>

            {/* 10. Your Rights */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.yourRights.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t("privacy.sections.yourRights.content1")}</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <li key={num}>{t(`privacy.sections.yourRights.items.${num}`)}</li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 text-gray-700">
                <p>{t("privacy.sections.yourRights.content2")}</p>
                <p>{t("privacy.sections.yourRights.content3")}</p>
                <p>{t("privacy.sections.yourRights.content4")}</p>
              </div>
            </section>

            {/* 11. Third Party Services */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.thirdPartyServices.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.thirdPartyServices.content1")}</p>
                <p>{t("privacy.sections.thirdPartyServices.content2")}</p>
                <p>{t("privacy.sections.thirdPartyServices.content3")}</p>
              </div>
            </section>

            {/* 12. Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.childrenPrivacy.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.childrenPrivacy.content1")}</p>
                <p>{t("privacy.sections.childrenPrivacy.content2")}</p>
                <p>{t("privacy.sections.childrenPrivacy.content3")}</p>
              </div>
            </section>

            {/* 13. Anonymous Reporting */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.anonymousReporting.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.anonymousReporting.content1")}</p>
                <p>{t("privacy.sections.anonymousReporting.content2")}</p>
                <p>{t("privacy.sections.anonymousReporting.content3")}</p>
                <p>{t("privacy.sections.anonymousReporting.content4")}</p>
                <p>{t("privacy.sections.anonymousReporting.content5")}</p>
              </div>
            </section>

            {/* 14. Cookies */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.cookies.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.cookies.content1")}</p>
                <p>{t("privacy.sections.cookies.content2")}</p>
                <p>{t("privacy.sections.cookies.content3")}</p>
                <p>{t("privacy.sections.cookies.content4")}</p>
                <p>{t("privacy.sections.cookies.content5")}</p>
              </div>
            </section>

            {/* 15. Changes */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.changes.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.changes.content1")}</p>
                <p>{t("privacy.sections.changes.content2")}</p>
                <p>{t("privacy.sections.changes.content3")}</p>
                <p>{t("privacy.sections.changes.content4")}</p>
                <p>{t("privacy.sections.changes.content5")}</p>
                <p>{t("privacy.sections.changes.content6")}</p>
              </div>
            </section>

            {/* 16. Contact */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.contact.title")}</h2>
              <div className="text-gray-700 space-y-2">
                <p>{t("privacy.sections.contact.content1")}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>{t("privacy.sections.contact.company")}</strong></p>
                  <p>{t("privacy.sections.contact.address")}</p>
                  <p className="mt-2">{t("privacy.sections.contact.content2")}</p>
                  <p>{t("privacy.sections.contact.content3")}</p>
                  <p>{t("privacy.sections.contact.content4")}</p>
                </div>
              </div>
            </section>

            {/* 17. EU Whistleblowing Directive */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.euWhistleblowing.title")}</h2>
              <div className="space-y-2 text-gray-700">
                <p>{t("privacy.sections.euWhistleblowing.content1")}</p>
                <p>{t("privacy.sections.euWhistleblowing.content2")}</p>
                <p>{t("privacy.sections.euWhistleblowing.content3")}</p>
                <p>{t("privacy.sections.euWhistleblowing.content4")}</p>
                <p>{t("privacy.sections.euWhistleblowing.content5")}</p>
                <p>{t("privacy.sections.euWhistleblowing.content6")}</p>
                <p>{t("privacy.sections.euWhistleblowing.content7")}</p>
                <p>{t("privacy.sections.euWhistleblowing.content8")}</p>
              </div>
            </section>

            <div className="pt-8 text-center text-sm text-gray-500">
              <p>{t("privacy.lastUpdated")}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Privacy;
