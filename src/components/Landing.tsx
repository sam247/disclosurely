
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SecureReport</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link to="/secure/tool" className="text-gray-600 hover:text-blue-600 transition-colors">
              Submit Report
            </Link>
            <Link to="/secure/tool/report-status" className="text-gray-600 hover:text-blue-600 transition-colors">
              Check Status
            </Link>
            <Link to="/dashboard/login" className="text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Whistleblower Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Report misconduct safely and anonymously with enterprise-grade encryption. 
            Your identity is protected while organizations get the information they need to act.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/secure/tool">
              <Button size="lg" className="w-full sm:w-auto">
                Submit Anonymous Report
              </Button>
            </Link>
            <Link to="/secure/tool/report-status">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Check Report Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SecureReport?</h2>
          <p className="text-lg text-gray-600">Built with security and privacy as the foundation</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">End-to-End Encryption</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your reports are encrypted before leaving your device using AES-256 encryption
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Complete Anonymity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Submit reports without revealing your identity. No tracking, no logs, no traces.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Secure Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Communicate securely with case handlers through encrypted messaging
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Complete audit logs ensure accountability while maintaining your privacy
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Organizations Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">For Organizations</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Provide your employees and stakeholders with a secure, trusted channel to report concerns. 
            Manage cases efficiently with role-based access and comprehensive audit trails.
          </p>
          <Link to="/dashboard/login">
            <Button variant="outline" size="lg">
              Access Organization Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="font-bold">SecureReport</span>
              </div>
              <p className="text-gray-400 text-sm">
                Secure whistleblower platform with enterprise-grade encryption and privacy protection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Whistleblowers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/secure/tool" className="hover:text-white">Submit Report</Link></li>
                <li><Link to="/secure/tool/report-status" className="hover:text-white">Check Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Organizations</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/dashboard/login" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Security</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>AES-256 Encryption</li>
                <li>Zero-Knowledge Architecture</li>
                <li>GDPR Compliant</li>
                <li>SOC 2 Type II</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SecureReport. All rights reserved. Built for security and privacy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
