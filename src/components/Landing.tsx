import { Shield, CheckCircle, MessageSquare, BarChart3, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';

const Landing = () => {
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
                  className="h-6 md:h-8 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <a href="https://app.disclosurely.com/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</a>
              <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </div>
            <div className="md:hidden">
              <a href="https://app.disclosurely.com/auth/login" className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[150px] pb-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Whistleblower
            <span className="block text-blue-600">Reporting Platform</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Enable anonymous reporting with enterprise-grade security. Protect your organization and employees with our compliant disclosure management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full sm:w-auto text-center">
              Start Free Trial
            </a>
            <Link to="/pricing" className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold w-full sm:w-auto text-center">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for secure reporting
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our platform provides comprehensive tools to manage whistleblower reports with complete confidentiality and compliance.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Anonymous Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Complete anonymity for whistleblowers with encrypted submissions and secure identity protection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Secure Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Two-way encrypted communication between whistleblowers and investigators while maintaining anonymity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Case Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Comprehensive dashboard to track, investigate, and resolve cases with full audit trails.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Multi-User Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Role-based permissions for legal, HR, and compliance teams with controlled access levels.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Regulatory Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Built-in compliance with GDPR, SOX, and other regulatory requirements across industries.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Bank-level encryption, secure hosting, and comprehensive data protection measures.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Choose the plan that fits your organization's needs. All plans include a 14-day free trial.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">£9.99</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <CardDescription className="text-sm sm:text-base">Perfect for small organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">5 cases/month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">1GB Storage</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Email Support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <a href="https://app.disclosurely.com/auth/signup">Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">£19.99</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <CardDescription className="text-sm sm:text-base">For growing organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Unlimited cases/month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Unlimited storage</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Secure two-way Messaging</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">AI Case Helper</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom branding</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Email Support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" asChild>
                  <a href="https://app.disclosurely.com/auth/signup">Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">Custom</span>
                </div>
                <CardDescription className="text-sm sm:text-base">For large organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Everything in Professional</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom domain</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Dedicated support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">SLA guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom integrations</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Organizations Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              See what our customers say about their experience with Disclosurely
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Disclosurely has transformed how we handle sensitive reports. The anonymous messaging feature is particularly valuable."
                </p>
                <div className="font-medium text-gray-900">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Chief Compliance Officer</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The platform is intuitive and secure. Our employees feel confident reporting issues, and we can investigate them effectively."
                </p>
                <div className="font-medium text-gray-900">Michael Chen</div>
                <div className="text-sm text-gray-500">HR Director</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Implementation was seamless and the support team was excellent. Highly recommend for any organization serious about compliance."
                </p>
                <div className="font-medium text-gray-900">Emily Rodriguez</div>
                <div className="text-sm text-gray-500">Legal Counsel</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Strengthen Your Compliance Program?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join organizations worldwide who trust Disclosurely for secure whistleblowing.
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

export default Landing;
