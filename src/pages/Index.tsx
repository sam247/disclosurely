
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MessageSquare, FileText, Users, Lock, Eye } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Disclosurely</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/secure/messages">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Check Report Status
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Organization Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Secure Whistleblower Reporting Platform
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Report misconduct safely and securely. Our platform ensures your anonymity 
              while providing organizations with the tools they need to address issues effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/secure/messages">
                <Button size="lg" className="w-full sm:w-auto">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Access Your Report
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Users className="h-5 w-5 mr-2" />
                  Organization Signup
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Security & Trust
            </h3>
            <p className="text-lg text-gray-600">
              Our platform prioritizes your safety and privacy above all else
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-blue-600 mb-4" />
                <CardTitle>End-to-End Encryption</CardTitle>
                <CardDescription>
                  All communications are encrypted using military-grade encryption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your reports and messages are protected with AES-256 encryption, 
                  ensuring only you and the organization can read them.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-8 w-8 text-green-600 mb-4" />
                <CardTitle>Anonymous Reporting</CardTitle>
                <CardDescription>
                  Submit reports without revealing your identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Choose to remain completely anonymous or provide contact information 
                  for follow-up communication.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-purple-600 mb-4" />
                <CardTitle>Secure Communication</CardTitle>
                <CardDescription>
                  Two-way encrypted messaging with organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Communicate safely with organizations handling your report 
                  through our secure messaging system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-orange-600 mb-4" />
                <CardTitle>Report Tracking</CardTitle>
                <CardDescription>
                  Monitor the progress of your submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive a unique tracking ID to check the status of your report 
                  and see updates from the organization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600 mb-4" />
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>
                  GDPR compliant with robust security measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We follow strict data protection protocols and maintain 
                  comprehensive audit trails for transparency.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-indigo-600 mb-4" />
                <CardTitle>Organization Tools</CardTitle>
                <CardDescription>
                  Comprehensive case management for organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organizations get powerful tools to manage cases, assign investigators, 
                  and track resolution progress.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-xl font-bold">Disclosurely</h4>
            </div>
            <p className="text-gray-400 mb-4">
              Secure whistleblower reporting for a more transparent world
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/secure/messages" className="text-gray-400 hover:text-white">
                Report Access
              </Link>
              <Link to="/auth/login" className="text-gray-400 hover:text-white">
                Organization Login
              </Link>
              <Link to="/auth/signup" className="text-gray-400 hover:text-white">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
