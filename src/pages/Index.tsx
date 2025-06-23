
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, MessageSquare, FileText, Users, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Disclosurely</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/secure/tool/messages">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Check Messages
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Secure • Anonymous • Confidential
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Secure Whistleblower
            <span className="text-blue-600 block">Reporting Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empowering organizations with secure, anonymous reporting tools that protect whistleblowers 
            while ensuring accountability and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started for Your Organization
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/secure/tool/messages">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                <MessageSquare className="mr-2 h-5 w-5" />
                Access Your Report Messages
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">End-to-End Encryption</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                All reports and communications are encrypted using AES-256 encryption, 
                ensuring maximum security and anonymity for whistleblowers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Secure Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Two-way encrypted messaging between whistleblowers and organizations, 
                maintaining anonymity while enabling follow-up questions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Organization Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Comprehensive management tools for organizations to handle reports, 
                assign cases, and maintain audit trails with role-based access.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
              <h3 className="font-semibold mb-2">Submit Report</h3>
              <p className="text-sm text-gray-600">Whistleblowers submit reports through secure, encrypted forms</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
              <h3 className="font-semibold mb-2">Get Tracking ID</h3>
              <p className="text-sm text-gray-600">Receive unique tracking ID and encryption key for secure access</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
              <h3 className="font-semibold mb-2">Secure Communication</h3>
              <p className="text-sm text-gray-600">Exchange encrypted messages with the organization</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">4</div>
              <h3 className="font-semibold mb-2">Resolution</h3>
              <p className="text-sm text-gray-600">Track progress and resolution while maintaining anonymity</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join organizations worldwide in creating safer, more transparent workplaces
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/secure/tool/messages">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                <MessageSquare className="mr-2 h-5 w-5" />
                Check Your Messages
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
