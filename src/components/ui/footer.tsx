import { Link } from "react-router-dom";
import { SystemStatusIndicator } from "@/components/SystemStatusIndicator";
import { useTranslation } from "react-i18next";
import { Linkedin, Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const langPrefix = currentLanguage && currentLanguage !== "en" ? `/${currentLanguage}` : "";

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/lovable-uploads/416d39db-53ff-402e-a2cf-26d1a3618601.png"
                alt="Disclosurely"
                className="h-7 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Secure whistleblowing platform for organizations. Anonymous reporting, end-to-end encryption, and
              compliance features.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to={`${langPrefix}/features`} className="text-gray-400 hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/pricing`} className="text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/compliance-software`} className="text-gray-400 hover:text-white">
                  Compliance Software
                </Link>
              </li>
               <li>
                <a href="https://status.disclosurely.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  System Status
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to={`${langPrefix}/about`} className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/careers`} className="text-gray-400 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/blog`} className="text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/contact`} className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://docs.disclosurely.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <Link to={`${langPrefix}/contact`} className="text-gray-400 hover:text-white">
                  Support
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/privacy`} className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/terms`} className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Disclosurely. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a
                  href="https://linkedin.com/company/disclosurely"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com/disclosurely"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/disclosurely"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
