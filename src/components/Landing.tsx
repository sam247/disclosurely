
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, MessageSquare, Users, FileText, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">SecureWhistle</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Case Studies</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">API & Integrations</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Resources</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/login">Log in</Link>
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/secure/tool">Try Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Secure Whistleblowing Platform
              <br />
              <span className="text-gray-900">for Modern Organizations</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Build trust and maintain compliance with enterprise-grade anonymous reporting. 
              Secure your organization today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="px-8 py-4 text-base bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/secure/tool">Start Free Trial</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-base" asChild>
                <Link to="/dashboard/login">See How It Works</Link>
              </Button>
            </div>

            {/* Simple feature highlights */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Anonymous Reporting</h3>
                <p className="text-gray-600 text-sm">Complete anonymity with zero tracking</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Advanced Encryption</h3>
                <p className="text-gray-600 text-sm">Military-grade security for all data</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Case Management</h3>
                <p className="text-gray-600 text-sm">Streamlined workflow and audit trails</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Effective Whistleblowing</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Secure Reporting Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm">
                  Give the public a secure way to alert you of potential issues within your organization and beyond.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Anonymous Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm">
                  Allow safe, reliable reports to be submitted without fear of retaliation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Secure Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm">
                  Two-way encrypted messaging allows secure follow-up without revealing identity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Customizable Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm">
                  Create custom intake forms tailored to your organization's specific needs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Real-time Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm">
                  Get instant notifications and comprehensive analytics on all submissions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Secure Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm">
                  All communications are encrypted end-to-end with enterprise-grade security.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How SecureWhistle Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How SecureWhistle Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Submit a Report</h3>
              <p className="text-gray-600">Use our secure form to submit your report anonymously. All data is encrypted before transmission.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Processing</h3>
              <p className="text-gray-600">Reports are automatically routed to the appropriate team with full audit trails and notifications.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Case Management</h3>
              <p className="text-gray-600">Investigators can securely communicate and manage cases while maintaining complete anonymity.</p>
            </div>
          </div>

          {/* Dashboard Preview Image Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                  <h4 className="font-semibold">SecureWhistle Dashboard</h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent Reports</span>
                    <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">Live</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded text-left">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Financial Irregularity</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-left">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Safety Concern</span>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Security & Compliance by Design</h2>
            <p className="text-xl text-blue-100 mb-12">
              Built to meet the highest standards of security and regulatory compliance
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="text-left">
                <div className="bg-blue-700 p-6 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-200 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
                  <p className="text-blue-100 text-sm">AES-256 encryption, zero-knowledge architecture, and SOC 2 Type II compliance ensure your data is always protected.</p>
                </div>
              </div>
              
              <div className="text-left">
                <div className="bg-blue-700 p-6 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-200 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">GDPR Compliant</h3>
                  <p className="text-blue-100 text-sm">Full GDPR compliance with data residency options and comprehensive audit trails for regulatory requirements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">"SecureWhistle has transformed how we handle compliance reporting. The anonymous reporting feature gives our employees confidence to speak up."</p>
                <div className="font-semibold text-gray-900">Sarah Chen</div>
                <div className="text-sm text-gray-500">Chief Compliance Officer</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">"The dashboard provides excellent visibility into our organization's ethics climate. Implementation was seamless."</p>
                <div className="font-semibold text-gray-900">Michael Rodriguez</div>
                <div className="text-sm text-gray-500">Risk Management Director</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">"Outstanding security features and excellent customer support. Exactly what we needed for our compliance program."</p>
                <div className="font-semibold text-gray-900">Emily Johnson</div>
                <div className="text-sm text-gray-500">Legal Counsel</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to implement secure whistleblowing in your organization?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of organizations who trust SecureWhistle for their compliance needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg" asChild>
                <Link to="/secure/tool">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link to="/dashboard/login">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold">SecureWhistle</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enterprise-grade whistleblowing platform for modern organizations.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SecureWhistle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
