import { Helmet } from 'react-helmet-async';
import { Footer } from '@/components/ui/footer';
import { Link } from 'react-router-dom';
import PublicLanguageSelector from '@/components/PublicLanguageSelector';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const Privacy = () => {
  useLanguageFromUrl();
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Disclosurely</title>
        <meta name="description" content="Privacy Policy for Disclosurely whistleblowing platform. Learn how we protect your personal data and respect your privacy." />
      </Helmet>
      
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
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
                <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
                <Link to="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </div>
              <div className="md:hidden">
                <Link to="/auth/login" className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Learn how we protect your personal data and respect your privacy.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="prose prose-gray max-w-none space-y-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="space-y-2 text-sm">
                <p><strong>Effective Date:</strong> 01/05/2025</p>
                <p><strong>Company:</strong> Disclosurely</p>
                <p><strong>Website:</strong> <a href="https://disclosurely.com" className="text-blue-600 hover:text-blue-800">https://disclosurely.com</a></p>
                <p><strong>Contact:</strong> <a href="mailto:support@disclosurely.com" className="text-blue-600 hover:text-blue-800">support@disclosurely.com</a></p>
                <p><strong>Registered Office:</strong> London, EC1V 2NX, United Kingdom</p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Disclosurely Limited ("Disclosurely", "we", "us" or "our") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store and protect your personal data when you use our whistleblowing platform at disclosurely.com (the "Service").
              </p>
              <p className="text-gray-700 leading-relaxed">
                We comply with the General Data Protection Regulation (EU 2016/679), the UK GDPR (as enacted in the Data Protection Act 2018), and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Data Controller and Data Processor</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>When we provide the Service to organisations (the "Customer"), that organisation acts as the Data Controller for whistleblower reports and any personal data it collects.</p>
                <p>Disclosurely acts as the Data Processor, processing personal data only on the Customer's documented instructions.</p>
                <p>For data related to your own use of disclosurely.com (e.g. your account, billing), Disclosurely is the Data Controller.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Personal Data We Collect</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>We may collect and process the following categories of data:</p>
                
                <div>
                  <h3 className="font-medium mb-2">a) From Customers (Account Holders)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Name, company details, contact information</li>
                    <li>Billing and payment details</li>
                    <li>Login credentials (username, email, password – encrypted)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">b) From Whistleblowers (Reporters)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Information you choose to submit in a report (which may include personal data, sensitive data, or special category data)</li>
                    <li>Optional contact details if you choose to provide them</li>
                    <li>Metadata such as IP address, browser type, device information (unless anonymised reporting is enabled)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">c) Technical Data</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Log files, usage statistics, and cookies (essential for site functionality)</li>
                    <li>Security and access data for auditing and fraud prevention</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. How We Use Personal Data</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">We use personal data for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>To provide, maintain and improve the Service</li>
                  <li>To authenticate and manage user accounts</li>
                  <li>To process subscription payments</li>
                  <li>To ensure the security and integrity of reports and communications</li>
                  <li>To comply with legal obligations and cooperate with regulatory authorities</li>
                  <li>For internal analytics (in anonymised and aggregated form only)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Legal Bases for Processing</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">We process personal data on the following legal bases:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Contractual necessity</strong> – to provide the Service you subscribe to</li>
                  <li><strong>Legitimate interests</strong> – to improve the Service, maintain security, and prevent fraud</li>
                  <li><strong>Legal obligations</strong> – to comply with applicable laws and regulations</li>
                  <li><strong>Consent</strong> – when you voluntarily provide sensitive or optional data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Hosting and Transfers</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>All data is hosted in Western EU (Ireland) on secure Supabase infrastructure.</p>
                <p>Data is not transferred outside the European Economic Area (EEA) or the UK, unless adequate safeguards are in place (such as Standard Contractual Clauses).</p>
                <p>Encryption is applied to protect data both in transit and at rest.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>Customer account data is retained for the duration of the subscription and for up to six years afterwards for accounting and legal purposes.</p>
                <p>Whistleblower reports are retained for as long as determined by the Customer (as Data Controller). Upon account termination, we will either delete or return all Customer Data within three months, unless law requires longer retention.</p>
                <p>Technical logs are kept for security monitoring for up to 12 months.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Disclosure of Personal Data</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">We do not sell or rent personal data. We may disclose data only to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The Customer (for whistleblower reports)</li>
                  <li>Trusted service providers (e.g. hosting, payment processing) under strict confidentiality agreements</li>
                  <li>Regulatory or law enforcement bodies if required by law</li>
                  <li>Professional advisors (lawyers, auditors) where necessary</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Security</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">We implement technical and organisational measures to protect personal data, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encryption (at rest and in transit)</li>
                  <li>Secure access controls and authentication</li>
                  <li>Regular audits and monitoring</li>
                  <li>Incident response procedures</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Your Rights</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>Depending on your role (Customer or Whistleblower) and applicable law, you may have rights to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your data</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your data</li>
                  <li>Restrict or object to processing</li>
                  <li>Port your data to another provider</li>
                  <li>Lodge a complaint with your supervisory authority (e.g. the ICO in the UK)</li>
                </ul>
                <p>If you are a whistleblower, you should contact the Customer (your organisation) to exercise your rights, as they are the Data Controller.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Disclosurely uses only essential cookies required for functionality and security. We do not use advertising or tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to this Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. Material changes will be notified to Customers by email or via the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">If you have questions or concerns about this Privacy Policy, please contact:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Disclosurely Limited</strong></p>
                  <p>London, EC1V 2NX, United Kingdom</p>
                  <p>Email: <a href="mailto:support@disclosurely.com" className="text-blue-600 hover:text-blue-800">support@disclosurely.com</a></p>
                </div>
              </div>
            </section>

            <div className="pt-8 text-center text-sm text-gray-500">
              <p>Last updated: May 2025</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Privacy;