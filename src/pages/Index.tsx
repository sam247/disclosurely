
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Disclosurely</h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Secure Whistleblower
            <span className="text-blue-600"> Reporting Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Empower your organization with a secure, anonymous reporting system that protects whistleblowers and ensures compliance.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link to="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto" />
                <CardTitle>Secure & Anonymous</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  End-to-end encryption ensures complete anonymity and security for all reports.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Lock className="h-12 w-12 text-green-600 mx-auto" />
                <CardTitle>GDPR Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built with privacy by design and full compliance with data protection regulations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Eye className="h-12 w-12 text-purple-600 mx-auto" />
                <CardTitle>Case Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive dashboard for managing, tracking, and resolving reports efficiently.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 text-orange-600 mx-auto" />
                <CardTitle>Secure Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Two-way encrypted messaging between whistleblowers and case handlers.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription>
                Join organizations worldwide who trust Disclosurely for secure whistleblowing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth/signup">
                  <Button size="lg">Create Account</Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Disclosurely. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
