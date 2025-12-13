import { Check, X, Shield, Zap, DollarSign, Users, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import PublicLanguageSelector from '@/components/PublicLanguageSelector';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import DynamicHelmet from '@/components/DynamicHelmet';

const VsSpeakUp = () => {
  useLanguageFromUrl();

  const comparisonPoints = [
    {
      category: "Pricing & Value",
      icon: DollarSign,
      items: [
        { feature: "Starting Price", disclosurely: "£39.99/month", competitor: "$99+/month", winner: "disclosurely" },
        { feature: "Annual Savings", disclosurely: "Save $708+/year", competitor: "More expensive", winner: "disclosurely" },
        { feature: "Transparent Pricing", disclosurely: "Public pricing", competitor: "Contact for quote", winner: "disclosurely" },
        { feature: "Free Trial", disclosurely: "7 days", competitor: "Custom demo", winner: "disclosurely" },
      ]
    },
    {
      category: "AI & Automation",
      icon: Zap,
      items: [
        { feature: "AI Case Analysis", disclosurely: true, competitor: false, winner: "disclosurely" },
        { feature: "AI Risk Assessment", disclosurely: true, competitor: false, winner: "disclosurely" },
        { feature: "AI Chat Support", disclosurely: true, competitor: false, winner: "disclosurely" },
        { feature: "Pattern Detection", disclosurely: true, competitor: false, winner: "disclosurely" },
        { feature: "Automated Assignment Rules", disclosurely: true, competitor: "Basic workflows", winner: "disclosurely" },
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
        { feature: "ISO 27701 Certified", disclosurely: false, competitor: true, winner: "competitor" },
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
        { feature: "Phone Hotline", disclosurely: false, competitor: true, winner: "competitor" },
      ]
    },
    {
      category: "Language & Global",
      icon: Globe,
      items: [
        { feature: "Languages Supported", disclosurely: "40+ languages", competitor: "70+ languages", winner: "competitor" },
        { feature: "AI Voice Reporting", disclosurely: false, competitor: true, winner: "competitor" },
        { feature: "Auto Translation", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Multi-Region Support", disclosurely: true, competitor: true, winner: "tie" },
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
      ]
    },
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/vs-speakup"
        fallbackTitle="Disclosurely vs SpeakUp - Save $708/Year with Advanced AI Features"
        fallbackDescription="Compare Disclosurely and SpeakUp whistleblowing platforms. Get AI case analysis, transparent pricing (£39.99 vs $99+/mo), and better automation. See the difference."
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
              <span className="text-sm font-semibold text-green-900">Save $708+ per year</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Disclosurely vs
              <span className="block text-blue-600 mt-2">SpeakUp</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get AI-powered case analysis, transparent pricing, and advanced automation—without the enterprise price tag.
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
                <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
                <div className="text-gray-900 font-semibold mb-1">Lower Cost</div>
                <div className="text-sm text-gray-600">£39.99/mo vs $99+/mo</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Transparent</div>
                <div className="text-gray-900 font-semibold mb-1">Public Pricing</div>
                <div className="text-sm text-gray-600">No need to contact sales</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">6+</div>
                <div className="text-gray-900 font-semibold mb-1">Exclusive AI Features</div>
                <div className="text-sm text-gray-600">Not available in SpeakUp</div>
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
                See exactly how Disclosurely compares to SpeakUp across all key areas
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
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 w-1/3">SpeakUp</th>
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
                Why Teams Choose Disclosurely Over SpeakUp
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    AI-Powered Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Exclusive AI features that automatically analyze cases, assess risk, detect patterns, and provide 24/7 chat support.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>AI analyzes every case automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Risk scores with reasoning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Pattern detection across reports</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Transparent Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Clear, public pricing at £39.99/month vs SpeakUp's hidden costs requiring sales contact. Save over $700/year.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>60% lower monthly cost</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>No surprise add-on fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Start trial without sales call</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Advanced Automation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Sophisticated assignment rules and SLA management that go beyond SpeakUp's basic workflows.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Multi-condition assignment rules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Automated SLA tracking & alerts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Smart escalation workflows</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Migration Section */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Easy Migration from SpeakUp
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Switch in days with our white-glove migration service. Zero downtime, zero hassle.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Export</h3>
                <p className="text-sm text-gray-600">We securely extract all your historical cases and data from SpeakUp</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Setup & Configuration</h3>
                <p className="text-sm text-gray-600">Configure Disclosurely with your branding and import all data</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Training & Go-Live</h3>
                <p className="text-sm text-gray-600">Comprehensive team training and dedicated onboarding support</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Save $708+/Year?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get AI-powered case analysis, transparent pricing, and better automation. No sales call required.
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

export default VsSpeakUp;
