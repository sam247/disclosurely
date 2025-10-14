import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import DynamicHelmet from "@/components/DynamicHelmet";
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
                  <a href="mailto:support@disclosurely.com" className="text-blue-600 hover:text-blue-800">
                    support@disclosurely.com
                  </a>
                </p>
                <p>
                  <strong>{t("privacy.info.office.label")}</strong> {t("privacy.info.office.value")}
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.introduction.title")}</h2>
              <p className="text-gray-700 leading-relaxed">{t("privacy.sections.introduction.content1")}</p>
              <p className="text-gray-700 leading-relaxed">{t("privacy.sections.introduction.content2")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.dataController.title")}</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>{t("privacy.sections.dataController.content1")}</p>
                <p>{t("privacy.sections.dataController.content2")}</p>
                <p>{t("privacy.sections.dataController.content3")}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.personalData.title")}</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>{t("privacy.sections.personalData.content1")}</p>

                <div>
                  <h3 className="font-medium mb-2">{t("privacy.sections.personalData.subsections.customer.title")}</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>{t("privacy.sections.personalData.subsections.customer.items.1")}</li>
                    <li>{t("privacy.sections.personalData.subsections.customer.items.2")}</li>
                    <li>{t("privacy.sections.personalData.subsections.customer.items.3")}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    {t("privacy.sections.personalData.subsections.whistleblower.title")}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.1")}</li>
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.2")}</li>
                    <li>{t("privacy.sections.personalData.subsections.whistleblower.items.3")}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t("privacy.sections.personalData.subsections.technical.title")}</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>{t("privacy.sections.personalData.subsections.technical.items.1")}</li>
                    <li>{t("privacy.sections.personalData.subsections.technical.items.2")}</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.usage.title")}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">{t("privacy.sections.usage.content1")}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("privacy.sections.usage.items.1")}</li>
                  <li>{t("privacy.sections.usage.items.2")}</li>
                  <li>{t("privacy.sections.usage.items.3")}</li>
                  <li>{t("privacy.sections.usage.items.4")}</li>
                  <li>{t("privacy.sections.usage.items.5")}</li>
                  <li>{t("privacy.sections.usage.items.6")}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.legalBases.title")}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">{t("privacy.sections.legalBases.content1")}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>{t("privacy.sections.legalBases.items.contractual.label")}</strong>{" "}
                    {t("privacy.sections.legalBases.items.contractual.content")}
                  </li>
                  <li>
                    <strong>{t("privacy.sections.legalBases.items.legitimate.label")}</strong>{" "}
                    {t("privacy.sections.legalBases.items.legitimate.content")}
                  </li>
                  <li>
                    <strong>{t("privacy.sections.legalBases.items.legal.label")}</strong>{" "}
                    {t("privacy.sections.legalBases.items.legal.content")}
                  </li>
                  <li>
                    <strong>{t("privacy.sections.legalBases.items.consent.label")}</strong>{" "}
                    {t("privacy.sections.legalBases.items.consent.content")}
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.dataHosting.title")}</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>{t("privacy.sections.dataHosting.content1")}</p>
                <p>{t("privacy.sections.dataHosting.content2")}</p>
                <p>{t("privacy.sections.dataHosting.content3")}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.dataRetention.title")}</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>{t("privacy.sections.dataRetention.content1")}</p>
                <p>{t("privacy.sections.dataRetention.content2")}</p>
                <p>{t("privacy.sections.dataRetention.content3")}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.disclosure.title")}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">{t("privacy.sections.disclosure.content1")}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("privacy.sections.disclosure.items.1")}</li>
                  <li>{t("privacy.sections.disclosure.items.2")}</li>
                  <li>{t("privacy.sections.disclosure.items.3")}</li>
                  <li>{t("privacy.sections.disclosure.items.4")}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.security.title")}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">{t("privacy.sections.security.content1")}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("privacy.sections.security.items.1")}</li>
                  <li>{t("privacy.sections.security.items.2")}</li>
                  <li>{t("privacy.sections.security.items.3")}</li>
                  <li>{t("privacy.sections.security.items.4")}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.yourRights.title")}</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>{t("privacy.sections.yourRights.content1")}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("privacy.sections.yourRights.items.1")}</li>
                  <li>{t("privacy.sections.yourRights.items.2")}</li>
                  <li>{t("privacy.sections.yourRights.items.3")}</li>
                  <li>{t("privacy.sections.yourRights.items.4")}</li>
                  <li>{t("privacy.sections.yourRights.items.5")}</li>
                  <li>{t("privacy.sections.yourRights.items.6")}</li>
                </ul>
                <p>{t("privacy.sections.yourRights.content2")}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.cookies.title")}</h2>
              <p className="text-gray-700 leading-relaxed">{t("privacy.sections.cookies.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.changes.title")}</h2>
              <p className="text-gray-700 leading-relaxed">{t("privacy.sections.changes.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.sections.contact.title")}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">{t("privacy.sections.contact.content1")}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>
                    <strong>{t("privacy.sections.contact.company")}</strong>
                  </p>
                  <p>{t("privacy.sections.contact.address")}</p>
                  <p>
                    Email:{" "}
                    <a href="mailto:support@disclosurely.com" className="text-blue-600 hover:text-blue-800">
                      support@disclosurely.com
                    </a>
                  </p>
                </div>
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
