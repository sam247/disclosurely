
import { Button } from "@/components/ui/button";
import {
  Clock,
  Shield,
  UserCheck,
  ChevronRight,
  Lock,
  Eye,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Disclosurely</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/auth/login" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link 
                to="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-8">
              <Lock className="w-4 h-4 mr-2" />
              Enterprise-Grade Security
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Secure Whistleblowing
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Enable anonymous reporting with complete confidentiality. Our platform ensures 
              your organization can address misconduct safely while protecting whistleblower identities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/secure/tool">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
                  Submit Report
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/secure/tool/report-status">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 border-gray-300 hover:bg-gray-50">
                  Check Report Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Disclosurely?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by organizations worldwide for secure, anonymous reporting
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">End-to-End Encryption</h3>
              <p className="text-gray-600 leading-relaxed">
                Military-grade AES-256 encryption ensures your reports remain completely secure 
                from submission to resolution.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Anonymity</h3>
              <p className="text-gray-600 leading-relaxed">
                Submit reports without revealing your identity. No personal information 
                required or stored in our system.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Communication</h3>
              <p className="text-gray-600 leading-relaxed">
                Two-way encrypted messaging allows safe follow-up communication 
                while maintaining complete anonymity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Trust & Compliance</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meeting the highest standards for data protection and regulatory compliance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-lg px-6 py-8 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-2">GDPR</div>
                <div className="text-sm text-gray-600">Compliant</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg px-6 py-8 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-2">ISO 27001</div>
                <div className="text-sm text-gray-600">Certified</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg px-6 py-8 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-2">SOC 2</div>
                <div className="text-sm text-gray-600">Type II</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg px-6 py-8 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Your voice matters. Report misconduct safely and help create a better, 
            more ethical workplace for everyone.
          </p>
          <Link to="/secure/tool">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              Submit Your Report Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Disclosurely</h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering organizations with secure, anonymous whistleblowing solutions. 
                Protecting those who speak up while ensuring accountability.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/secure/tool" className="hover:text-white transition-colors">Submit Report</Link></li>
                <li><Link to="/secure/tool/report-status" className="hover:text-white transition-colors">Check Status</Link></li>
                <li><Link to="/auth/login" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Disclosurely. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
