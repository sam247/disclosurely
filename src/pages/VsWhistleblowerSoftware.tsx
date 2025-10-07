import { Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import PublicLanguageSelector from '@/components/PublicLanguageSelector';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const VsWhistleblowerSoftware = () => {
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
      feature: "Two-Way Communication",
      disclosurely: true,
      competitor: false,
      description: "Secure messaging while maintaining anonymity"
    },
    {
      feature: "Unlimited Users",
      disclosurely: true,
      competitor: false,
      description: "No restrictions on number of users or cases"
    },
    {
      feature: "Custom Branding",
      disclosurely: true,
      competitor: true,
      description: "Fully customizable branding and domain"
    },
    {
      feature: "GDPR Compliance",
      disclosurely: true,
      competitor: false,
      description: "Built-in GDPR compliance and data protection"
    },
    {
      feature: "Mobile Optimized",
      disclosurely: true,
      competitor: false,
      description: "Responsive design works on all devices"
    },
    {
      feature: "Real-time Notifications",
      disclosurely: true,
      competitor: false,
      description: "Instant alerts for new cases and updates"
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
            <span className="block text-blue-600">Whistleblower Software</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            See why organizations choose Disclosurely over traditional whistleblower software solutions.
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
              See how Disclosurely stacks up against traditional whistleblower software
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Disclosurely</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Traditional Software</th>
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

      {/* Why Choose Disclosurely */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Disclosurely?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Superior Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Military-grade encryption, zero-knowledge architecture, and ISO 27001 certification ensure maximum data protection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">True Anonymity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced anonymization techniques and secure two-way communication without compromising whistleblower identity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Unlimited Scale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No restrictions on users, cases, or files. Built to scale with organizations of any size.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Upgrade Your Whistleblowing Platform?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join organizations worldwide who trust Disclosurely for secure, anonymous reporting.
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

export default VsWhistleblowerSoftware;
