
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, MessageSquare, Users, FileText, Bell, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SecureWhistle</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/secure/tool" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Submit Report
            </Link>
            <Link to="/secure/tool/report-status" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Check Status
            </Link>
            <Link to="/dashboard/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/secure/tool">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Secure Whistleblowing Platform
              <br />
              <span className="text-blue-600">for Modern Organizations</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Empower your workforce to report misconduct safely and anonymously. 
              Built with enterprise-grade security and designed for compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg" asChild>
                <Link to="/secure/tool">Start Free Report</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
                <Link to="/dashboard/login">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SecureWhistle?</h2>
            <p className="text-xl text-gray-600">Built with security and privacy as the foundation</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Anonymous Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Submit reports without revealing your identity. Complete anonymity with zero tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Military-grade AES-256 encryption protects your data from submission to resolution.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Secure Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Two-way encrypted messaging allows secure follow-up without revealing identity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Case Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Streamlined workflow for investigators with role-based access and audit trails.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Compliance Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  SOX, GDPR, and industry compliance built-in with comprehensive reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-teal-50 to-teal-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Real-time Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Instant notifications for new reports with customizable escalation rules.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How SecureWhistle Works</h2>
            <p className="text-xl text-gray-600">Simple, secure, and completely anonymous</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Submit a Report</h3>
              <p className="text-gray-600">Use our secure form to submit your report anonymously. All data is encrypted before transmission.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Processing</h3>
              <p className="text-gray-600">Reports are automatically routed to the appropriate team with full audit trails and notifications.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Case Management</h3>
              <p className="text-gray-600">Investigators can securely communicate and manage cases while maintaining complete anonymity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to implement secure whistleblowing in your organization?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of organizations who trust SecureWhistle for their compliance and ethics reporting needs.
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
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">SecureWhistle</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enterprise-grade whistleblowing platform designed for modern organizations who prioritize security and compliance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Platform</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/secure/tool" className="hover:text-white transition-colors">Submit Report</Link></li>
                <li><Link to="/secure/tool/report-status" className="hover:text-white transition-colors">Check Status</Link></li>
                <li><Link to="/dashboard/login" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Security & Compliance</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>SOC 2 Type II Certified</li>
                <li>GDPR Compliant</li>
                <li>AES-256 Encryption</li>
                <li>Zero-Knowledge Architecture</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SecureWhistle. All rights reserved. Enterprise whistleblowing made secure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
