import { Link } from "react-router-dom";
import { SystemStatusIndicator } from "@/components/SystemStatusIndicator";
export const Footer = () => {
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
                <Link to="/pricing" className="text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/compliance-software" className="text-gray-400 hover:text-white">
                  Compliance Software
                </Link>
              </li>
              <li>
                <Link to="/whistleblowing-directive" className="text-gray-400 hover:text-white">
                  Whistleblowing Directive
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/compliance-software" className="text-gray-400 hover:text-white">
                  Compliance Software
                </Link>
              </li>
              <li>
                <Link to="/whistleblowing-directive" className="text-gray-400 hover:text-white">
                  Whistleblowing Directive
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/auth/login" className="text-gray-400 hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="text-gray-400 hover:text-white">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white">
                  News
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="https://disclosurely.featurebase.app/help" className="text-gray-400 hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Support
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Disclosurely. All rights reserved.{" "}
              <Link to="/compliance-software" className="hover:text-white">
                Compliance Software
              </Link>
              .
            </p>
            <SystemStatusIndicator />
          </div>
        </div>
      </div>
    </footer>
  );
};
