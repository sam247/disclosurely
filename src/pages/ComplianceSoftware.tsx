import { Shield, Lock, Users, FileText, CheckCircle, Globe, Award, Mail, MessageSquare, BarChart3, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Footer } from "@/components/ui/footer";
import DynamicHelmet from "@/components/DynamicHelmet";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import { AnnouncementBar } from "@/components/AnnouncementBar";

const ComplianceSoftware = () => {
  return (
    <>
      <DynamicHelmet
        pageIdentifier="/compliance-software"
        fallbackTitle="Compliance Software for Whistleblowing & Anonymous Reporting | Disclosurely"
        fallbackDescription="Simplify whistleblowing compliance with secure anonymous reporting software. GDPR compliant, EU Directive ready, ISO 27001 certified. Start free trial today."
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
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <a
                  href="https://app.disclosurely.com/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </a>
              </div>
              <div className="md:hidden">
                <a
                  href="https://app.disclosurely.com/auth/login"
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </nav>

        <AnnouncementBar />

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              Trusted by hundreds of UK organisations
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Compliance Software That Makes Whistleblowing Simple and Secure
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline regulatory obligations, protect whistleblowers, and build an ethical workplace culture with Disclosurely's anonymous reporting platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://app.disclosurely.com/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center"
              >
                Start Free Trial
              </a>
              <a
                href="#how-it-works"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center"
              >
                See How It Works
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                <span>End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: What Is Compliance Software? */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">What Is Compliance Software?</h2>
              <div className="max-w-3xl mx-auto text-lg text-gray-600 space-y-4">
                <p>
                  Compliance software is a digital platform that centralises whistleblowing, anonymous reporting, and regulatory management into a single, secure system. Instead of relying on fragmented email threads, anonymous hotlines, or manual documentation, organisations use compliance software to create professional, confidential reporting channels that protect both employees and the business.
                </p>
                <p>
                  Disclosurely transforms complex legal requirements—from the EU Whistleblowing Directive to UK PIDA (Public Interest Disclosure Act) and GDPR data protection—into streamlined, automated processes. This means compliance officers can focus on investigating concerns rather than managing paperwork, while whistleblowers feel safe knowing their identity is protected with military-grade encryption throughout the entire investigation process.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Centralised Reporting</h3>
                <p className="text-gray-600">All concerns flow through one secure system</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Investigation Management</h3>
                <p className="text-gray-600">Streamlined workflows with automated notifications</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Regulatory Compliance</h3>
                <p className="text-gray-600">Built-in compliance with EU, UK, and GDPR requirements</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Why Whistleblowing Matters */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why Whistleblowing and Anonymous Reporting Matter</h2>
                <div className="space-y-4 text-lg text-gray-600">
                  <p>
                    Whistleblowing serves as an early warning system for fraud, harassment, safety violations, and misconduct. When employees can safely report concerns, organisations detect issues before they escalate into legal crises, financial losses, or reputational damage. Yet <strong className="text-gray-900">42% of employees cite fear of retaliation</strong> as the primary reason they don't report misconduct.
                  </p>
                  <p>
                    Anonymous reporting software removes that fear by protecting whistleblower identity throughout the entire investigation process. This results in <strong className="text-gray-900">30-50% higher reporting rates</strong>, giving compliance teams the visibility they need to address problems early.
                  </p>
                  <p>
                    The business impact is measurable: organisations with robust whistleblowing systems experience fewer incidents, lower legal costs, stronger reputations, and enhanced employee trust. Research shows that <strong className="text-gray-900">high-trust workplaces have 74% less stress and 50% higher productivity</strong>.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">The Impact of Anonymous Reporting</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl font-bold text-blue-600">30-50%</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Higher Reporting Rates</h4>
                      <p className="text-gray-600 text-sm">When anonymity is protected</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl font-bold text-blue-600">74%</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Less Stress</h4>
                      <p className="text-gray-600 text-sm">In high-trust workplaces</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl font-bold text-blue-600">50%</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Higher Productivity</h4>
                      <p className="text-gray-600 text-sm">From psychological safety</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl font-bold text-blue-600">42%</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Fear of Retaliation</h4>
                      <p className="text-gray-600 text-sm">Prevents reporting without protection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Regulatory Compliance Requirements */}
        <section id="how-it-works" className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Meeting Your Regulatory Obligations</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Disclosurely ensures your organisation meets complex regulatory requirements across jurisdictions
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-4">EU Whistleblowing Directive</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600"><strong className="text-gray-900">Applies to:</strong> Organisations with 50+ employees</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Requirements:</strong> Internal reporting channels, 7-day acknowledgment, 3-month feedback</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Encryption:</strong> GDPR-compliant encryption mandated</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Protection:</strong> Whistleblowers must be protected from retaliation</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-4">UK PIDA (Public Interest Disclosure)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600"><strong className="text-gray-900">Protects:</strong> Workers exposing wrongdoing since 1998</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Requires:</strong> Clear policies and accessible reporting channels</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Cross-border:</strong> Must address both UK and EU requirements</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Access:</strong> Web, phone, SMS, mobile app options</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-4">GDPR and Data Protection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600"><strong className="text-gray-900">Encryption:</strong> Data encrypted at rest and in transit</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Pseudonymisation:</strong> Identity protection throughout process</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Access Controls:</strong> Granular permissions and audit logs</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Retention:</strong> Defined periods with automated management</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 4: Essential Features */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Essential Features of Effective Compliance Software</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Disclosurely provides everything you need for secure, compliant whistleblowing
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Secure Anonymous Reporting Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Multiple reporting options protect whistleblowers regardless of location or device:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Web forms, mobile apps, phone lines, SMS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>End-to-end encryption (ISO 27001, SOC Type II)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>True anonymity throughout investigation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Two-Way Anonymous Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Investigators can ask follow-up questions without revealing identity:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Secure messaging with unique case numbers and PINs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Keeps whistleblowers engaged and informed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Maintains anonymity while gathering evidence</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Comprehensive Case Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Automated workflows streamline investigations:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Automated routing to appropriate teams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Priority classification and severity tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Evidence storage with complete audit trails</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Multi-Language Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Global organisations need global support:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Reporting in 35+ languages via ML and translation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Every employee can report in their native language</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Critical for multinational operations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Real-Time Analytics and Dashboards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Instant visibility into compliance health:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Pattern recognition identifies recurring issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Customisable reports for audits and regulators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>ROI tracking and compliance metrics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">GDPR-Compliant Data Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Enterprise-grade security built-in:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Encrypted data storage in certified facilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Automated retention period management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Full audit trail for regulatory compliance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" className="text-lg">
                <a href="https://app.disclosurely.com/auth/signup">See Disclosurely in Action</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 5: Business Benefits */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">The Business Impact of Compliance Software</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-4">Risk Mitigation and Cost Avoidance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600"><strong className="text-gray-900">Avoid fines:</strong> GDPR penalties range from €40k to €877M</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Early detection:</strong> Issues caught before legal crises</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Documentation:</strong> Comprehensive audit trails demonstrate compliance</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Insurance:</strong> Reduced liability and risk premiums</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-4">Operational Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600"><strong className="text-gray-900">40-75%:</strong> Improvement in compliance efficiency</p>
                  <p className="text-gray-600"><strong className="text-gray-900">50%:</strong> Reduction in compliance management costs</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Automation:</strong> Eliminate manual administrative tasks</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Faster audits:</strong> Immediate access to all documentation</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-4">Building Trust and Culture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600"><strong className="text-gray-900">Transparency:</strong> Demonstrates organisational commitment</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Safety:</strong> Employees feel safe speaking up</p>
                  <p className="text-gray-600"><strong className="text-gray-900">50% higher:</strong> Productivity in high-trust workplaces</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Retention:</strong> Reduced turnover and improved loyalty</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 6: Implementation */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Implementing Your Compliance Software Successfully</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Choosing the Right Platform</h3>
                    <p className="text-gray-600">
                      Evaluate security certifications, user experience, customisation capabilities, and vendor support. Ensure scalability for growing organisations and verify compliance with your specific regulatory requirements.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Promoting Your Reporting System</h3>
                    <p className="text-gray-600">
                      Regular communications, training sessions, and leadership messaging demonstrate organisational commitment. Visible placement of reporting information across workplaces addresses scepticism—42% believe no action will be taken, so prove otherwise through transparency.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Establishing Clear Policies</h3>
                    <p className="text-gray-600">
                      Define what can be reported, how reports are handled, and protection measures. Document investigation procedures and timelines. Make policies easily accessible in plain language to encourage reporting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Implementation Checklist</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">Set up secure reporting channels</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">Configure automated workflows</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">Train investigation teams</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">Launch communication campaign</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">Monitor and refine processes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Why Choose Disclosurely */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why Organisations Choose Disclosurely</h2>
              <div className="text-lg text-gray-600 space-y-4">
                <p>
                  Disclosurely stands out through our <strong className="text-gray-900">UK/EU compliance expertise</strong>, purpose-built for organisations navigating the EU Whistleblowing Directive, UK PIDA, and GDPR requirements. Our platform combines <strong className="text-gray-900">ease of use with enterprise security</strong>—what takes competitors weeks to configure, takes minutes with our intuitive interface.
                </p>
                <p>
                  Unlike generic ticketing systems or complex GRC platforms, Disclosurely is designed specifically for whistleblowing. This means faster setup, lower costs, and superior protection of whistleblower anonymity. Plus, our <strong className="text-gray-900">white-glove customer support</strong> ensures compliance teams have dedicated experts helping them succeed, not just documentation.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">Minutes</div>
                <p className="text-gray-600">Setup time vs. weeks with competitors</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">ISO 27001</div>
                <p className="text-gray-600">Certified security standards</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <p className="text-gray-600">Dedicated support and monitoring</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Future of Compliance */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">The Future of Compliance Software</h2>
              <div className="text-lg text-gray-600 space-y-4">
                <p>
                  The future of compliance software lies in intelligent automation. AI and machine learning already support report triage, risk scoring, and predictive analytics—helping compliance teams prioritise urgent matters while maintaining oversight of all concerns. These technologies work behind the scenes to surface patterns and anomalies humans might miss.
                </p>
                <p>
                  However, <strong className="text-gray-900">human judgment remains essential</strong> for sensitive whistleblowing matters. Disclosurely balances AI-powered efficiency with human decision-making, ensuring technology enhances rather than replaces the empathy and discernment required when employees trust us with their concerns. We're continuously improving our platform while keeping whistleblower protection at the centre of everything we build.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Transform Your Compliance Programme?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Non-compliance risks fines, legal action, and reputational damage. Disclosurely helps organisations build ethical cultures while meeting regulatory obligations. Get started today with a free trial—no credit card required, setup in minutes, cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg">
                <a href="https://app.disclosurely.com/auth/signup">Start Your Free Trial</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-blue-700 text-lg">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
            <p className="text-sm text-blue-200">✓ No credit card required • ✓ Setup in minutes • ✓ Cancel anytime</p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ComplianceSoftware;
