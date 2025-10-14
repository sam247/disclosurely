import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import DynamicHelmet from "@/components/DynamicHelmet";
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t("terms.hero.title")}</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("terms.hero.description")}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.introduction.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("terms.sections.introduction.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.accounts.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("terms.sections.accounts.content1")}</p>
              <p className="text-muted-foreground leading-relaxed">{t("terms.sections.accounts.content2")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.acceptableUse.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("terms.sections.acceptableUse.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.intellectualProperty.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.intellectualProperty.content")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.disclaimer.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("terms.sections.disclaimer.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.limitationOfLiability.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.limitationOfLiability.content")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.governingLaw.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("terms.sections.governingLaw.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.sections.changes.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("terms.sections.changes.content")}</p>
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
