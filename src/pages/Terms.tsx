import { Helmet } from 'react-helmet-async';
import { Footer } from '@/components/ui/footer';
import { Link } from 'react-router-dom';
import PublicLanguageSelector from '@/components/PublicLanguageSelector';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const Terms = () => {
  useLanguageFromUrl();
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - Disclosurely</title>
        <meta name="description" content="Terms and Conditions for Disclosurely whistleblowing platform services." />
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
              Terms and Conditions
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Disclosurely Limited (London EC1V 2NX) provides a secure, online whistleblowing platform at disclosurely.com (the "Service"). By registering for and using the Service, you agree to these Terms. The Service enables whistleblowers to submit confidential reports of misconduct within their organisation. Disclosurely is committed to GDPR compliance and maintains strict privacy, security and legal standards. Contact for support is support@disclosurely.com.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Services Provided</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Disclosurely offers a software-as-a-service whistleblowing platform that allows organisations (the Customer) to receive, manage and investigate internal reports of wrongdoing. The Service includes secure report submission, case management and communication tools. Disclosurely hosts all Service data in Supabase's Western EU (Ireland) region to ensure GDPR compliance. The Service is provided on a subscription basis as described below.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Account Registration and Use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To use the Service, the Customer must register for an account and provide accurate, complete information. The registered account holder must be a natural person of legal age. The Customer is responsible for all use of the Service under its account and for any of its authorised users. The Customer must keep usernames, passwords and security credentials confidential and must promptly notify Disclosurely of any suspected account compromise. The Customer remains responsible for any activity by its authorised users (including breaches of these Terms). Disclosurely may suspend or terminate an account for breach of these Terms or any unlawful use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Fees and Payment Terms</h2>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>Disclosurely offers two subscription tiers, billed monthly in advance:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Starter: £9.99 per month</li>
                    <li>Pro: £19.99 per month</li>
                  </ul>
                  <p>
                    Prices are exclusive of VAT. The Customer selects its tier upon signup and may upgrade or downgrade by agreement with Disclosurely. Invoices are issued in British Pounds and are payable within 30 days of invoice date. Payment is made by credit or debit card or other methods as agreed, and will automatically recur each month unless the Customer cancels. Unpaid fees may accrue interest and late-payment charges according to law. Subscription fees are non-refundable once paid, except as required by mandatory law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Customer Obligations</h2>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>The Customer agrees to use the Service only for lawful purposes and in accordance with these Terms. In particular:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The Customer shall not reverse engineer, decompile or otherwise attempt to derive the source code of the Service, or use the Service to build a competing product.</li>
                    <li>The Customer shall not introduce any viruses, malware or malicious code into the Service.</li>
                    <li>The Customer shall not violate the rights of any third party (including intellectual property or privacy rights).</li>
                    <li>The Customer must ensure it has the necessary rights and consents for any data or content it uploads or submits; it is responsible for the accuracy and lawfulness of all Customer Data.</li>
                    <li>The Customer shall keep its account credentials confidential and shall be responsible for any use of the Service under its account.</li>
                    <li>The Customer will comply with all applicable laws and regulations (including data protection laws) in its use of the Service.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Disclosurely (or its licensors) retains all intellectual property rights in the Service, including the software, platform, trademarks and documentation. No ownership in the Service is transferred to the Customer. The Customer is granted only a limited, revocable licence to use the Service during its subscription term. Nothing in these Terms confers any right to use Disclosurely's trademarks or other proprietary rights, nor any right to the underlying source code.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Confidentiality</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Both parties shall keep confidential all non-public information received from the other that is marked or otherwise clearly identified as confidential. The receiving party must use at least the same degree of care to protect the other's Confidential Information as it uses to protect its own confidential information of like kind (no less than reasonable care). Confidential Information may be disclosed only to employees or agents who need to know it for the purposes of this Agreement and who are bound by confidentiality obligations. Neither party will disclose the other's Confidential Information except to the extent required by law or court order; in such case, prior notice will be given where legally permitted. The confidentiality obligations survive termination of the Agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Data Protection and GDPR</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Disclosurely processes personal data in compliance with GDPR (EU 2016/679), the UK GDPR (Data Protection Act 2018) and other applicable privacy laws. Disclosurely will process personal data only on the Customer's instructions and will implement appropriate technical and organisational measures to safeguard it. These include encryption, pseudonymisation, resilient storage, backups and restricted access. Hosting in an EU region (Ireland) ensures data remains within the European Economic Area. The Customer is the data controller of any personal data collected through the Service; Disclosurely acts as a data processor. The Customer must ensure that all data subjects (e.g. whistleblowers) have been provided any required notices and consents. At the end of a subscription, Disclosurely will, at the Customer's choice, return or securely delete Customer Data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Term and Termination</h2>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>The subscription term is monthly. By default, the agreement renews automatically for successive months until terminated. Either party may terminate the subscription by giving at least 30 days' prior written notice, effective at the end of a billing period. If either party materially breaches these Terms and fails to remedy the breach within 30 days of written notice, the other party may terminate immediately. The Customer's failure to pay fees when due is a material breach.</p>
                  <p>Upon termination or expiration:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>All licences under these Terms immediately cease and the Customer must stop using the Service.</li>
                    <li>Disclosurely will make the Customer's data available for export in a common format.</li>
                    <li>Disclosurely will securely delete the Customer's data no later than three months after termination, unless otherwise required by law.</li>
                  </ul>
                  <p>Disclosurely reserves the right to anonymise and aggregate usage data for internal research and development after deletion of identifiable data.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Liability and Indemnification</h2>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p><strong>Liability:</strong> Disclosurely's liability for losses is limited to the direct, proven loss suffered by the Customer, up to an amount equal to the total subscription fees paid for the preceding 12 months. Disclosurely is not liable for any indirect or consequential losses (including loss of profit, data or goodwill). This liability cap does not apply to loss resulting from gross negligence or wilful misconduct, and neither party's liability for death or personal injury (to the extent not excluded by law) or for fraud is limited.</p>
                  <p><strong>Indemnification:</strong> Each party agrees to indemnify and hold the other harmless from third-party claims arising from its breach of these Terms or its misconduct. The Customer will indemnify Disclosurely against any claim arising from Customer's use of the Service or any content provided by the Customer. Disclosurely will indemnify the Customer against any claim that using the Service (as permitted by these Terms) infringes the intellectual property rights of a third party.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to these Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Disclosurely may revise these Terms from time to time, for example to reflect changes in the Service, legal requirements or pricing. We will provide reasonable advance notice of any material amendments, and the updated terms will take effect upon renewal of the Customer's subscription or as required by law. Continued use of the Service after such changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Governing Law and Dispute Resolution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are governed by the laws applicable to Disclosurely. The parties submit to the non-exclusive jurisdiction of the courts having jurisdiction over the matter. Any dispute arising under these Terms will first be addressed by good-faith negotiation between senior representatives of the parties. If unresolved, disputes may be resolved in a court of competent jurisdiction in the United Kingdom or as otherwise agreed by the parties.
                </p>
              </section>

            <div className="pt-8 text-center text-sm text-gray-500">
              <p>Last updated: September 2025</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Terms;