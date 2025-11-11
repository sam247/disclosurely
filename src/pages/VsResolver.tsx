import { Check, X, Shield, Zap, DollarSign, Users, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import PublicLanguageSelector from '@/components/PublicLanguageSelector';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import DynamicHelmet from '@/components/DynamicHelmet';

const VsResolver = () => {
  useLanguageFromUrl();

  const comparisonPoints = [
    {
      category: "Pricing & Value",
      icon: DollarSign,
      items: [
        { feature: "Starting Price", disclosurely: "£39.99/month", competitor: "Custom enterprise", winner: "disclosurely" },
        { feature: "Transparent Pricing", disclosurely: "Public pricing", competitor: "Contact for quote", winner: "disclosurely" },
        { feature: "Free Trial", disclosurely: "14 days, instant", competitor: "Custom demo", winner: "disclosurely" },
        { feature: "Best For", disclosurely: "SMB to mid-market", competitor: "Large enterprise", winner: "tie" },
      ]
    },
    {
      category: "Focus & Scope",
      icon: Shield,
      items: [
        { feature: "Platform Focus", disclosurely: "Whistleblowing-first", competitor: "Broad GRC platform", winner: "tie" },
        { feature: "Ease of Use", disclosurely: "Simple, focused", competitor: "Complex, comprehensive", winner: "disclosurely" },
        { feature: "Setup Time", disclosurely: "5 minutes", competitor: "Weeks to months", winner: "disclosurely" },
        { feature: "Risk Management Tools", disclosurely: "Focused on cases", competitor: "Comprehensive GRC", winner: "competitor" },
      ]
    },
    {
      category: "AI & Automation",
      icon: Zap,
      items: [
        { feature: "AI Case Analysis", disclosurely: true, competitor: "Limited", winner: "disclosurely" },
        { feature: "AI Risk Assessment", disclosurely: true, competitor: "Basic AI", winner: "disclosurely" },
        { feature: "AI Chat Support", disclosurely: true, competitor: false, winner: "disclosurely" },
        { feature: "Pattern Detection", disclosurely: true, competitor: "Basic", winner: "disclosurely" },
        { feature: "Assignment Automation", disclosurely: "Advanced rules", competitor: "Basic workflows", winner: "disclosurely" },
        { feature: "SLA Management", disclosurely: "Automated", competitor: "Manual", winner: "disclosurely" },
      ]
    },
    {
      category: "Platform Features",
      icon: Lock,
      items: [
        { feature: "Anonymous Reporting", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Two-Way Messaging", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Custom Branding", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "GDPR Compliance", disclosurely: true, competitor: true, winner: "tie" },
        { feature: "Unlimited Reports", disclosurely: true, competitor: "Based on plan", winner: "disclosurely" },
        { feature: "Session Management", disclosurely: true, competitor: false, winner: "disclosurely" },
      ]
    },
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/vs-resolver"
        fallbackTitle="Disclosurely vs Resolver - Focused Whistleblowing vs Broad GRC"
        fallbackDescription="Compare Disclosurely and Resolver. Get purpose-built whistleblowing with modern AI at transparent pricing. When Resolver's GRC platform is more than you need."
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Disclosurely vs
              <span className="block text-blue-600 mt-2">Resolver</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Purpose-built whistleblowing with modern AI vs. comprehensive GRC platform. Sometimes simpler is better.
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

        {/* Quick Comparison */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">£39.99</div>
                <div className="text-gray-900 font-semibold mb-1">Transparent Pricing</div>
                <div className="text-sm text-gray-600">vs Custom enterprise quotes</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Focused</div>
                <div className="text-gray-900 font-semibold mb-1">Whistleblowing-First</div>
                <div className="text-sm text-gray-600">vs Broad GRC platform</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">5 min</div>
                <div className="text-gray-900 font-semibold mb-1">Setup Time</div>
                <div className="text-sm text-gray-600">vs Weeks of implementation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Comparison */}
        <div className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Feature-by-Feature Comparison
              </h2>
              <p className="text-lg text-gray-600">
                Focused whistleblowing solution vs. comprehensive GRC platform
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
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 w-1/3">Resolver</th>
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

        {/* Why Choose Section */}
        <div className="bg-gray-50 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                When to Choose Disclosurely Over Resolver
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Whistleblowing-First
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Resolver is a broad GRC platform. Disclosurely is purpose-built for whistleblowing. If you just need secure reporting, why pay for features you won't use?
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    Modern AI Built-In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Our AI analyzes every case automatically, assesses risk, detects patterns, and provides 24/7 support—capabilities Resolver's platform doesn't offer.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Transparent Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    £39.99/month. No hidden fees, no surprise costs, no enterprise negotiations. Know exactly what you'll pay before you start.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get Purpose-Built Whistleblowing
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Sometimes you don't need a comprehensive GRC platform. You just need great whistleblowing software.
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
            <p className="text-blue-100 text-sm mt-4">14-day free trial • No credit card required • Cancel anytime</p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default VsResolver;
