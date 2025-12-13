import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import { useLanguageFromUrl } from "@/hooks/useLanguageFromUrl";
import DynamicHelmet from "@/components/DynamicHelmet";

const WhistleblowingDirective = () => {
  useLanguageFromUrl();
  return <>
      <DynamicHelmet
        pageIdentifier="/whistleblowing-directive"
        fallbackTitle="EU Whistleblowing Directive 2019/1937 | Compliance Guide"
        fallbackDescription="Complete guide to the EU Whistleblowing Directive 2019/1937 and what it means for organizations and employees across Europe. Understand your compliance obligations."
      />

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3">
                  <img src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" alt="Disclosurely" className="h-6 md:h-8 w-auto" loading="lazy" decoding="async" />
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <PublicLanguageSelector />
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">Whistleblowing Directive 2023: 
What You Need to Know

          </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Whistleblowing is an essential tool for transparency and accountability across both public and private
              sectors in Europe. It allows individuals to report wrongdoing, corruption, or unethical practices, helping
              to tackle fraud, misconduct, and abuse of power.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <p className="text-muted-foreground leading-relaxed">
                To ensure whistleblowers are protected from retaliation, the European Union introduced the
                Whistleblowing Directive (EU 2019/1937). This legislation requires all member states to implement
                national frameworks that guarantee safe reporting channels and protection for those who speak up.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What is the EU Whistleblowing Directive?</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>
                  The Directive, adopted on 23 October 2019, establishes a uniform set of rules across the EU to protect
                  individuals who report breaches of law in their workplace.
                </p>
                <p>It applies to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Public and private companies with 50 or more employees</li>
                  <li>Municipalities with 10,000+ inhabitants</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Who is Covered?</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>The Directive protects a wide range of individuals, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Employees (full-time, part-time, and temporary)</li>
                  <li>Self-employed individuals, contractors, and consultants</li>
                  <li>Shareholders and board members</li>
                  <li>Volunteers, trainees, and job applicants</li>
                  <li>Third parties such as suppliers and subcontractors</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What Wrongdoings Are Covered?</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>The Directive covers breaches in areas such as:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Financial services and anti-money laundering</li>
                  <li>Public procurement and fraud</li>
                  <li>Product and transport safety</li>
                  <li>Environmental protection and nuclear safety</li>
                  <li>Food, feed, and animal health</li>
                  <li>Public health and consumer protection</li>
                  <li>Data protection, privacy, and IT security</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Key Requirements for Organisations</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Protection from Retaliation</h3>
                  <div className="text-muted-foreground leading-relaxed space-y-1">
                    <p>
                      Whistleblowers must be safeguarded against dismissal, demotion, harassment, or any form of
                      retaliation.
                    </p>
                    <p>
                      The burden of proof lies with the employer – they must prove any action taken against a
                      whistleblower was not linked to the report.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Confidentiality and Anonymity</h3>
                  <div className="text-muted-foreground leading-relaxed space-y-1">
                    <p>Reports must be handled in strict confidence.</p>
                    <p>
                      Organisations must provide the option for anonymous reporting where permitted by national law.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Secure Reporting Channels</h3>
                  <div className="text-muted-foreground leading-relaxed space-y-1">
                    <p>Companies must implement clear, secure, and confidential channels for reporting.</p>
                    <p>Only authorised personnel should access the reports.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">4. Timely Response</h3>
                  <div className="text-muted-foreground leading-relaxed space-y-1">
                    <p>Acknowledgement of the report within 7 days.</p>
                    <p>Feedback to the reporter within 3 months on the progress or outcome.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">5. Training and Awareness</h3>
                  <div className="text-muted-foreground leading-relaxed space-y-1">
                    <p>Staff must be informed of reporting options and their rights.</p>
                    <p>Training should ensure managers understand how to handle reports responsibly.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Reporting Channels Under the Directive</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>Whistleblowers can report through:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Internal channels:</strong> reporting within the organisation to designated staff or
                    systems.
                  </li>
                  <li>
                    <strong>External channels:</strong> reporting to regulatory or government authorities.
                  </li>
                  <li>
                    <strong>Public disclosure:</strong> as a last resort, if internal and external channels fail, or if
                    there is imminent public risk.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How the Directive Protects Whistleblowers</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>The Directive guarantees:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Confidentiality of identity throughout the process</li>
                  <li>Prohibition of retaliation by employers or colleagues</li>
                  <li>Reversed burden of proof in retaliation cases</li>
                  <li>Remedies and support – including legal and financial assistance</li>
                  <li>Protection from liability when reporting breaches of EU law</li>
                  <li>Coverage for a wide range of roles beyond traditional employees</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What This Means for Employees</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>If you raise concerns under the Directive, you are protected provided:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You had reasonable grounds to believe the information was true at the time of reporting.</li>
                  <li>You used approved internal or external channels.</li>
                  <li>
                    Public disclosure is made only if urgent public interest is at risk, or if internal/external routes
                    fail.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">What This Means for Companies</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>You must establish compliant reporting systems if you have 50+ employees.</p>
                <p>Reports must be handled confidentially, securely, and without retaliation.</p>
                <p>
                  A clear policy and designated reporting officer (or third-party provider like Disclosurely) should be
                  in place.
                </p>
                <p>All data relating to reports must be processed in line with GDPR.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Local Law Differences</h2>
              <p className="text-muted-foreground leading-relaxed">
                While the EU Directive sets a common framework, individual countries may adapt details into national law
                (e.g. Germany's HinSchG, Spain's Ley Whistleblowing). Companies operating across borders must check
                local requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How Disclosurely Helps</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Disclosurely provides a GDPR-compliant, EU-hosted reporting platform designed to help organisations
                  comply with the Directive.
                </p>
                <p>With Disclosurely you get:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Secure, encrypted, and anonymous reporting channels</li>
                  <li>Case management and follow-up tools</li>
                  <li>Compliance with response timeframes (acknowledgement & feedback)</li>
                  <li>Simple monthly subscription plans (Starter & Pro)</li>
                </ul>
                <p>
                  👉 Learn more at{" "}
                  <a href="https://disclosurely.com" className="text-blue-600 hover:text-blue-700">
                    https://disclosurely.com
                  </a>
                  .
                </p>
              </div>
            </section>

            <div className="pt-8 text-center text-sm text-gray-500">
              <p>Last updated: September 2025</p>
            </div>
          </div>
        </div>

        {/* Related Pages */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Related Compliance Resources</h2>
              <p className="text-gray-600">Learn more about compliance and regulations</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/compliance-software" className="block group">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Compliance Software</h3>
                  <p className="text-gray-600 text-sm">
                    Explore our compliance software designed to help you meet EU Whistleblowing Directive requirements.
                  </p>
                </div>
              </Link>

              <Link to="/features" className="block group">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Platform Features</h3>
                  <p className="text-gray-600 text-sm">
                    Discover how our features help you stay compliant with secure reporting, encryption, and audit trails.
                  </p>
                </div>
              </Link>

              <Link to="/pricing" className="block group">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Get Started</h3>
                  <p className="text-gray-600 text-sm">
                    View pricing plans and start your compliance journey with a 7-day free trial.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>;
};
export default WhistleblowingDirective;