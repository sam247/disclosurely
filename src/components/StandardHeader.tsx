import { Link } from "react-router-dom";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import { useTranslation } from "react-i18next";
import { AnnouncementBar } from '@/components/AnnouncementBar';

interface StandardHeaderProps {
  currentLanguage?: string;
}

export const StandardHeader = ({ currentLanguage }: StandardHeaderProps) => {
  const { t } = useTranslation();
  const langPrefix = currentLanguage && currentLanguage !== "en" ? `/${currentLanguage}` : "";

  return (
    <>
      <AnnouncementBar />
      <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png"
                alt="Disclosurely"
                className="h-5 sm:h-6 md:h-8 w-auto"
                loading="eager"
                fetchPriority="high"
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
          <div className="md:hidden flex items-center gap-1.5">
            <PublicLanguageSelector />
            <Link
              to={`${langPrefix}/auth/login`}
              className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs whitespace-nowrap"
            >
              {t("nav.signin")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};
