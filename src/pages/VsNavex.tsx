import { Check, X, Shield, Zap, DollarSign, Users, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import PublicLanguageSelector from '@/components/PublicLanguageSelector';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import DynamicHelmet from '@/components/DynamicHelmet';

const VsNavex = () => {
  useLanguageFromUrl();

  const comparisonPoints = [
    {
      category: "Pricing & Value",
      icon: DollarSign,
      items: [
        { feature: "Starting Price", disclosurely: "£39.99/month", competitor: "$667+/month", winner: "disclosurely" },
        { feature: "Annual Savings", disclosurely: "Save $7,500+/year", competitor: "Enterprise pricing", winner: "disclosurely" },
        { feature: "Transparent Pricing", disclosurely: "Public pricing", competitor: "Contact for quote", winner: "disclosurely" },
        { feature: "Free Trial", disclosurely: "7 days, instant access", competitor: "Custom demo only", winner: "disclosurely" },
        { feature: "Best For", disclosurely: "SMBs to Enterprise", competitor: "Large Enterprise", winner: "tie" },
      ]
    },
    {
      category: "AI & Modern Features",
      icon: Zap,
      items: [
        { feature: "AI Case Analysis", disclosurely: true, competitor: "Basic AI tools", winner: "disclosurely" },
        { feature: "AI Risk Assessment", disclosurely: true, competitor: "Limited", winner: "disclosurely" },
        { feature: "AI Chat Support", disclosurely: true, competitor: false, winner: "disclosurely" },
        { feature: "Pattern Detection", disclosurely: true, competitor: "Basic", winner: "disclosurely" },
        { feature: "Automated Assignment Rules", disclosurely: "Advanced", competitor: "Basic", winner: "disclosurely" },
        { feature: "SLA Management", disclosurely: "Automated", competitor: "Manual", winner: "disclosurely" },
      ]
    },
    {
      category: "Security & Compliance",
      icon: Lock,
      items: [
        { feature: "End-to-End Encryption", disclosurely: "AES-256-GCM", competitor: "Yes", winner: "tie" },
        { feature: "GDPR Compliant", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "ISO 27001 Certified", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Data Residency Options", disclosurely: "EU/US", competitor: "Global", winner: "competitor" },
        { feature: "Zero-Knowledge Architecture", disclosurely: true, competitor: false, winner: "disclosurely" },
        { feature: "Session Management", disclosurely: true, competitor: false, winner: "disclosurely" },
      ]
    },
    {
      category: "Platform Features",
      icon: Shield,
      items: [
        { feature: "Unlimited Reports", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Unlimited Storage", disclosurely: true, competitor: "Based on plan", winner: "disclosurely" },
        { feature: "Two-Way Messaging", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Custom Branding", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Custom Domain (CNAME)", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Real-time Analytics", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "24/7 Phone Hotline", disclosurely: false, competitor: true, winner: "competitor" },
        { feature: "Modern UI/UX", disclosurely: "Modern", competitor: "Legacy", winner: "disclosurely" },
      ]
    },
    {
      category: "Language & Global",
      icon: Globe,
      items: [
        { feature: "Languages Supported", disclosurely: "40+ languages", competitor: "150+ languages", winner: "competitor" },
        { feature: "AI Translation", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Multi-Channel Reporting", disclosurely: "Web, Mobile", competitor: "Web, Mobile, Phone", winner: "competitor" },
        { feature: "Global Infrastructure", disclosurely: "Growing", competitor: "Extensive", winner: "competitor" },
      ]
    },
    {
      category: "Team & Collaboration",
      icon: Users,
      items: [
        { feature: "Team Members", disclosurely: "Unlimited (Pro)", competitor: "Based on plan", winner: "disclosurely" },
        { feature: "Role-Based Access", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Assignment Automation", disclosurely: "Advanced rules", competitor: "Basic workflows", winner: "disclosurely" },
        { feature: "Case Escalation", disclosurely: "Automated SLA", competitor: "Manual", winner: "disclosurely" },
        { feature: "PowerBI Integration", disclosurely: false, competitor: true, winner: "competitor" },
      ]
    },
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/vs-navex"
        fallbackTitle="Disclosurely vs NAVEX (EthicsPoint) - Save $7,500/Year with Modern AI"
        fallbackDescription="Compare Disclosurely and NAVEX EthicsPoint. Get enterprise features at SMB pricing (£39.99 vs $667+/mo). Modern AI, better automation, transparent pricing."
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
                    loading="lazy"
                    decoding="async"
                    className="h-8 w-auto"
                  />
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <PublicLanguageSelector />
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
                <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
                <Link to="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Save $7,500+ per year</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Disclosurely vs
              <span className="block text-blue-600 mt-2">NAVEX (EthicsPoint)</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get enterprise-grade whistleblowing with modern AI at SMB pricing. No enterprise price tag required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://app.disclosurely.com/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
              >
                Start Free Trial
              </a>
              <Link
                to="/pricing"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Comparison Highlights */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">94%</div>
                <div className="text-gray-900 font-semibold mb-1">Lower Cost</div>
                <div className="text-sm text-gray-600">£39.99/mo vs $667/mo</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Modern</div>
                <div className="text-gray-900 font-semibold mb-1">AI-Powered Platform</div>
                <div className="text-sm text-gray-600">vs Legacy Infrastructure</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Instant</div>
                <div className="text-gray-900 font-semibold mb-1">Start Today</div>
                <div className="text-sm text-gray-600">No sales calls required</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Comparison by Category */}
        <div className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Feature-by-Feature Comparison
              </h2>
              <p className="text-lg text-gray-600">
                Enterprise features without the enterprise price tag
              </p>
            </div>

            <div className="space-y-12">
              {comparisonPoints.map((category, idx) => {
                const IconComponent = category.icon;
                return (
                  <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <div className="flex items-center gap-3 text-white">
                        <IconComponent className="h-6 w-6" />
                        <h3 className="text-xl font-bold">{category.category}</h3>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/3">Feature</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 w-1/3">Disclosurely</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 w-1/3">NAVEX</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {category.items.map((item, itemIdx) => (
                            <tr key={itemIdx} className={`hover:bg-gray-50 ${item.winner === 'disclosurely' ? 'bg-blue-50/30' : ''}`}>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{item.feature}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof item.disclosurely === 'boolean' ? (
                                  item.disclosurely ? (
                                    <div className="flex items-center justify-center">
                                      <Check className="h-6 w-6 text-green-600" />
                                      {item.winner === 'disclosurely' && (
                                        <span className="ml-2 text-xs font-semibold text-blue-600">Winner</span>
                                      )}
                                    </div>
                                  ) : (
                                    <X className="h-6 w-6 text-gray-400 mx-auto" />
                                  )
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <span className="font-semibold text-gray-900">{item.disclosurely}</span>
                                    {item.winner === 'disclosurely' && (
                                      <span className="text-xs font-semibold text-blue-600 mt-1">Winner</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof item.competitor === 'boolean' ? (
                                  item.competitor ? (
                                    <div className="flex items-center justify-center">
                                      <Check className="h-6 w-6 text-green-600" />
                                      {item.winner === 'competitor' && (
                                        <span className="ml-2 text-xs font-semibold text-gray-600">Winner</span>
                                      )}
                                    </div>
                                  ) : (
                                    <X className="h-6 w-6 text-gray-400 mx-auto" />
                                  )
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <span className="font-semibold text-gray-700">{item.competitor}</span>
                                    {item.winner === 'competitor' && (
                                      <span className="text-xs font-semibold text-gray-600 mt-1">Winner</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why Choose Disclosurely */}
        <div className="bg-gray-50 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Modern Alternative to NAVEX EthicsPoint
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                When NAVEX is too expensive and complex for your needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Affordable Enterprise Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Get the same compliance features at 94% lower cost. Perfect for growing companies who need enterprise quality without enterprise pricing.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Save $7,500+ annually</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Transparent, public pricing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>No hidden fees or add-ons</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Modern AI Technology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Built-from-scratch with AI at the core, not bolted on. Get advanced case analysis, risk assessment, and automation that NAVEX's legacy platform can't match.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>AI analyzes every case</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Pattern detection across reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>24/7 AI chat support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Quick Implementation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Start in minutes, not months. No lengthy sales cycles, complex contracts, or enterprise onboarding. Just sign up and go.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>5-minute setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>No sales calls required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Instant 7-day trial</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Who Should Choose What */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Which Solution is Right for You?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Choose Disclosurely if you:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Need transparent, affordable pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Want modern AI-powered case analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Prefer self-service setup and onboarding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Are a growing SMB or mid-market company</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Value modern UX and ease of use</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose NAVEX if you:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span>Are a Fortune 500 with unlimited budget</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span>Need 150+ language support globally</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span>Require 24/7 phone hotline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span>Have complex multi-national operations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span>Want established enterprise vendor</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Save $7,500+/Year?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get enterprise-grade whistleblowing with modern AI. No enterprise price tag or sales calls required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://app.disclosurely.com/auth/signup"
                className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold inline-block transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="mailto:sales@disclosurely.com"
                className="border-2 border-white text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold inline-block transition-colors"
              >
                Schedule Demo
              </a>
            </div>
            <p className="text-blue-100 text-sm mt-4">7-day free trial • Cancel anytime</p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default VsNavex;
