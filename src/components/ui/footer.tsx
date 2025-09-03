import { Link } from 'react-router-dom';

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
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Secure whistleblowing platform for organizations. Anonymous reporting, 
              end-to-end encryption, and compliance features.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link to="/compliance-software" className="text-gray-400 hover:text-white">Compliance Software</Link></li>
              <li><Link to="/vs-whistleblower-software" className="text-gray-400 hover:text-white">Disclosurely vs Whistleblower Software</Link></li>
              <li><Link to="/vs-speak-up" className="text-gray-400 hover:text-white">Disclosurely vs Speak Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/auth/login" className="text-gray-400 hover:text-white">Sign In</Link></li>
              <li><Link to="/auth/signup" className="text-gray-400 hover:text-white">Get Started</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Certifications Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="font-semibold text-white mb-2 flex items-center justify-center lg:justify-start gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Certifications
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                We're in the process of obtaining the following industry standard certifications to ensure the highest level of security and compliance.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <img 
                  src="/lovable-uploads/9762866a-d8d9-4860-bf30-3ffd178885a8.png" 
                  alt="ISO 27001 Certification" 
                  className="h-12 w-12 opacity-80 hover:opacity-100 transition-opacity"
                />
                <span className="text-xs text-gray-400 ml-2">ISO 27001</span>
              </div>
              
              <div className="flex items-center gap-1">
                <img 
                  src="/lovable-uploads/70aa6ac0-c161-4167-921d-79f08f6f4b02.png" 
                  alt="GDPR Compliant" 
                  className="h-12 w-12 opacity-80 hover:opacity-100 transition-opacity"
                />
                <span className="text-xs text-gray-400 ml-2">GDPR</span>
              </div>
              
              <div className="flex items-center gap-1">
                <img 
                  src="/lovable-uploads/a9716d48-ff27-4193-b51c-9b035d1692b0.png" 
                  alt="AICPA SOC" 
                  className="h-12 w-12 opacity-80 hover:opacity-100 transition-opacity"
                />
                <span className="text-xs text-gray-400 ml-2">AICPA SOC</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 Disclosurely. All rights reserved. <Link to="/compliance-software" className="hover:text-white">Compliance Software</Link>. Powered by <a href="https://betterranking.co.uk/?utm_source=footer&utm_medium=internal&utm_campaign=disclosurely&utm_id=links" target="_blank" rel="noopener noreferrer" className="hover:text-white">Better Ranking</a>.</p>
        </div>
      </div>
    </footer>
  );
};