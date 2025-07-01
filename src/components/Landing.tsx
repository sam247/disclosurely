import { Shield, Users, Lock, FileText, Bell, Star, Check, DollarSign, Globe, Eye, Award, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Disclosurely</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="https://app.disclosurely.com/auth/login" className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </a>
              <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Updated padding from py-[135px] to py-[125px] */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 py-[125px]">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Whistleblowing
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Provide your organization with a secure, anonymous platform for reporting misconduct. 
            Built with enterprise-grade security and compliance in mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold">
              Start Free Trial
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Our platform provides the highest level of security and anonymity for whistleblowers
              while giving organizations the tools they need to manage reports effectively.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                All reports are encrypted with AES-256 encryption before transmission and storage.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Anonymous Reporting</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Whistleblowers can submit reports completely anonymously with secure follow-up communication.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Compliance Ready</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Built to meet GDPR, SOX, and other regulatory requirements with full audit trails.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Organizations Worldwide
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              From startups to Fortune 500 companies, organizations trust Disclosurely
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Corporate</h3>
              <p className="text-sm text-gray-600">Large enterprises and multinational corporations</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Healthcare</h3>
              <p className="text-sm text-gray-600">Hospitals and healthcare organizations</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Government</h3>
              <p className="text-sm text-gray-600">Public sector and government agencies</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Eye className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Non-Profit</h3>
              <p className="text-sm text-gray-600">NGOs and charitable organizations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Bank-Level Security
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Your data is protected with the same security standards used by financial institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ISO 27001 Certified</h3>
                  <p className="text-gray-600 text-sm sm:text-base">International standard for information security management</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero-Trust Architecture</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Every request is verified and authenticated</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Regular Penetration Testing</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Quarterly security audits by third-party experts</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Certifications</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 text-sm sm:text-base">SOC 2 Type II</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 text-sm sm:text-base">GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 text-sm sm:text-base">HIPAA Ready</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 text-sm sm:text-base">ISO 27001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 text-sm sm:text-base">4.9/5 from 2,400+ reviews</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  "Disclosurely has transformed how we handle sensitive reports. The platform is intuitive and our employees feel safe using it."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Sarah Johnson</p>
                    <p className="text-gray-500 text-xs">Compliance Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  "The security features are outstanding. We can confidently assure our stakeholders that reports are handled with utmost care."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Michael Rodriguez</p>
                    <p className="text-gray-500 text-xs">CISO, Global Healthcare Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  "Implementation was seamless and the support team is exceptional. Best investment we've made in compliance technology."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">LC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Lisa Chen</p>
                    <p className="text-gray-500 text-xs">HR Director, Financial Services LLC</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Choose the plan that's right for your organization
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">$29</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <CardDescription className="text-sm sm:text-base">Perfect for small organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Up to 50 reports/month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Basic encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Email support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Standard branding</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="relative border-blue-200 shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">$99</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <CardDescription className="text-sm sm:text-base">For growing organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Unlimited reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Advanced encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom branding</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Analytics dashboard</span>
                  </div>
                </div>
                <Button className="w-full mt-6">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative sm:col-span-2 lg:col-span-1">
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
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Everything in Professional</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom domain</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Dedicated support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">SLA guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
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

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Simple, secure, and anonymous reporting in three easy steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Submit Report</h3>
              <p className="text-gray-600 text-sm sm:text-base px-2">
                Whistleblowers submit reports through a secure, encrypted form with optional anonymity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Secure Processing</h3>
              <p className="text-gray-600 text-sm sm:text-base px-2">
                Reports are processed securely and assigned to authorized personnel for investigation.
              </p>
            </div>

            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Follow-up</h3>
              <p className="text-gray-600 text-sm sm:text-base px-2">
                Secure, anonymous communication allows for follow-up questions and updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Secure Your Organization?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join organizations worldwide who trust Disclosurely for secure whistleblowing.
          </p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            Get Started Today
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Disclosurely</h3>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Secure whistleblowing platform for modern organizations.
              </p>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Compliance</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2024 Disclosurely. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
