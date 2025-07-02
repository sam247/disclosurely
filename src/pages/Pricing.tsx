
import { Shield, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Pricing = () => {
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
              <a href="/" className="text-xl sm:text-2xl font-bold text-gray-900">Disclosurely</a>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="/pricing" className="text-blue-600 hover:text-blue-700 px-2 sm:px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </a>
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="block text-blue-600">Pricing</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Choose the plan that's right for your organization. Start with our free trial and upgrade as you grow.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Start Free Trial
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
                  Start Free Trial
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

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes, all plans come with a 14-day free trial. No credit card required.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">Absolutely! You can upgrade or downgrade your plan at any time from your dashboard.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What security certifications do you have?</h3>
              <p className="text-gray-600">We're ISO 27001 certified, SOC 2 Type II compliant, and GDPR ready.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join organizations worldwide who trust Disclosurely for secure whistleblowing.
          </p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            Start Free Trial
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
                <li><a href="/#features" className="text-gray-400 hover:text-white text-sm sm:text-base">Features</a></li>
                <li><a href="/#security" className="text-gray-400 hover:text-white text-sm sm:text-base">Security</a></li>
                <li><a href="/compliance-software" className="text-gray-400 hover:text-white text-sm sm:text-base">Compliance</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white text-sm sm:text-base">Pricing</a></li>
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
              © 2025 Disclosurely. All rights reserved. <a href="/compliance-software" className="text-blue-400 hover:text-blue-300">Compliance Software</a>. Powered by <a href="https://betterranking.co.uk/?utm_source=footer&utm_medium=internal&utm_campaign=disclosurely&utm_id=links" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">Better Ranking</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
