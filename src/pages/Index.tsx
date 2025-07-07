import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Star,
  ArrowRight,
  Globe,
  Clock,
  FileText,
  Eye,
  Zap,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" 
                alt="Disclosurely" 
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link to="/compliance-software" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link to="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Secure Whistleblowing for a Safer Workplace
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8">
            Empower your employees to speak up with confidence. Protect your organization with our secure, anonymous reporting platform.
          </p>
          <div className="space-x-4">
            <Link to="/auth/signup">
              <Button className="text-lg">Start Free Trial</Button>
            </Link>
            <Link to="/compliance-software">
              <Button variant="outline" className="text-lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Anonymous Reporting */}
            <Card>
              <CardHeader>
                <Shield className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle>Anonymous Reporting</CardTitle>
                <CardDescription>
                  Ensure confidentiality with fully anonymous report submissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Protect whistleblowers and encourage open communication.
                </p>
              </CardContent>
            </Card>

            {/* End-to-End Encryption */}
            <Card>
              <CardHeader>
                <Lock className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle>End-to-End Encryption</CardTitle>
                <CardDescription>
                  Secure every report with advanced encryption technology.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Safeguard sensitive information from unauthorized access.
                </p>
              </CardContent>
            </Card>

            {/* Secure Messaging */}
            <Card>
              <CardHeader>
                <MessageSquare className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle>Secure Messaging</CardTitle>
                <CardDescription>
                  Communicate securely with reporters while maintaining anonymity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Investigate reports effectively with encrypted conversations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Why Choose Disclosurely?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Increased Trust */}
            <Card>
              <CardHeader>
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <CardTitle>Increased Trust</CardTitle>
                <CardDescription>
                  Foster a culture of trust and transparency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Encourage employees to report concerns without fear of retaliation.
                </p>
              </CardContent>
            </Card>

            {/* Early Detection */}
            <Card>
              <CardHeader>
                <Eye className="h-6 w-6 text-green-600 mb-2" />
                <CardTitle>Early Detection</CardTitle>
                <CardDescription>
                  Identify and address issues before they escalate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Mitigate risks and protect your organization's reputation.
                </p>
              </CardContent>
            </Card>

            {/* Compliance */}
            <Card>
              <CardHeader>
                <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                <CardTitle>Compliance</CardTitle>
                <CardDescription>
                  Meet regulatory requirements with a secure reporting system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ensure adherence to industry standards and best practices.
                </p>
              </CardContent>
            </Card>

            {/* Enhanced Reputation */}
            <Card>
              <CardHeader>
                <Star className="h-6 w-6 text-green-600 mb-2" />
                <CardTitle>Enhanced Reputation</CardTitle>
                <CardDescription>
                  Demonstrate your commitment to ethical conduct.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Build a positive brand image and attract top talent.
                </p>
              </CardContent>
            </Card>

            {/* Cost Savings */}
            <Card>
              <CardHeader>
                <Zap className="h-6 w-6 text-green-600 mb-2" />
                <CardTitle>Cost Savings</CardTitle>
                <CardDescription>
                  Reduce the financial impact of fraud and misconduct.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Prevent costly litigation and regulatory fines.
                </p>
              </CardContent>
            </Card>

            {/* Global Accessibility */}
            <Card>
              <CardHeader>
                <Globe className="h-6 w-6 text-green-600 mb-2" />
                <CardTitle>Global Accessibility</CardTitle>
                <CardDescription>
                  Enable reporting from anywhere in the world.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Support a diverse and inclusive workplace culture.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Trusted by Organizations Worldwide
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <Card>
              <CardContent className="relative">
                <Badge className="absolute top-4 right-4">Verified</Badge>
                <p className="text-gray-700 mb-4">
                  "Disclosurely has transformed our compliance program. The anonymous reporting feature has significantly increased employee participation."
                </p>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="font-semibold text-gray-900">Acme Corp</p>
                    <p className="text-gray-600">HR Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card>
              <CardContent className="relative">
                <Badge className="absolute top-4 right-4">Verified</Badge>
                <p className="text-gray-700 mb-4">
                  "We were able to identify and resolve a critical issue early on thanks to Disclosurely's secure reporting system. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="font-semibold text-gray-900">Beta Industries</p>
                    <p className="text-gray-600">Compliance Officer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join hundreds of organizations already using Disclosurely to create a safer, more ethical workplace.
          </p>
          <Link to="/auth/signup">
            <Button className="text-lg">Start Your Free Trial Today <ArrowRight className="ml-2" /></Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" 
                  alt="Disclosurely" 
                  className="h-8 w-auto mr-3 filter brightness-0 invert"
                />
                <span className="text-xl font-bold">Disclosurely</span>
              </div>
              <p className="text-gray-400 mb-4">
                Secure whistleblowing platform for organizations worldwide. 
                Anonymous reporting with end-to-end encryption.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/compliance-software" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Disclosurely. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
