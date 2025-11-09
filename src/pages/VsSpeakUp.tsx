import { Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import PublicLanguageSelector from '@/components/PublicLanguageSelector';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const VsSpeakUp = () => {
  useLanguageFromUrl();
  const features = [
    {
      feature: "End-to-End Encryption",
      disclosurely: true,
      competitor: false,
      description: "Military-grade AES-256 encryption for all data"
    },
    {
      feature: "Anonymous Reporting", 
      disclosurely: true,
      competitor: true,
      description: "Complete anonymity protection for whistleblowers"
    },
    {
      feature: "Custom Domain",
      disclosurely: true,
      competitor: false,
      description: "Your own branded domain for reporting"
    },
    {
      feature: "Unlimited Cases",
      disclosurely: true,
      competitor: false,
      description: "No restrictions on number of cases or reports"
    },
    {
      feature: "Two-Way Messaging",
      disclosurely: true,
      competitor: true,
      description: "Secure communication with whistleblowers"
    },
    {
      feature: "Mobile App",
      disclosurely: true,
      competitor: true,
      description: "Native mobile applications available"
    },
    {
      feature: "GDPR Compliance",
      disclosurely: true,
      competitor: false,
      description: "Built-in GDPR compliance and data protection"
    },
    {
      feature: "Multi-Language Support",
      disclosurely: true,
      competitor: true,
      description: "Support for multiple languages"
    },
    {
      feature: "Advanced Analytics",
      disclosurely: true,
      competitor: false,
      description: "Comprehensive reporting and insights"
    },
    {
      feature: "ISO 27001 Certified",
      disclosurely: true,
      competitor: false,
      description: "International security standard certification"
    }
  ];

  return (
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[150px] pb-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Disclosurely vs
            <span className="block text-blue-600">Speak Up</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Compare Disclosurely with Speak Up to see why we're the better choice for secure whistleblowing.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Feature Comparison
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              See how Disclosurely compares to Speak Up across key features
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Disclosurely</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Speak Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {features.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.feature}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.disclosurely ? (
                        <Check className="h-6 w-6 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.competitor ? (
                        <Check className="h-6 w-6 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Key Advantages */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Key Advantages Over Speak Up
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Superior Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  End-to-end encryption with zero-knowledge architecture ensures your data is completely secure, unlike Speak Up's basic security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Unlimited Everything</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No limits on cases, users, or files. Speak Up restricts features based on pricing tiers, we don't.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Better Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built-in GDPR compliance, ISO 27001 certification, and comprehensive audit trails that Speak Up lacks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Migration Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Easy Migration from Speak Up
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Switch from Speak Up to Disclosurely with zero downtime. Our team will handle the entire migration process for you.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">1. Data Export</h3>
              <p className="text-sm text-gray-600">We securely export all your existing cases and data from Speak Up</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">2. Setup & Import</h3>
              <p className="text-sm text-gray-600">Configure your Disclosurely account and import all historical data</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">3. Team Training</h3>
              <p className="text-sm text-gray-600">Train your team on the new platform with dedicated support</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Switch from Speak Up?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join organizations who've made the switch to better security and unlimited features.
          </p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            Start Free Trial
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VsSpeakUp;
