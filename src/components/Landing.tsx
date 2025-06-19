
import { Button } from "@/components/ui/button";
import {
  Clock,
  Shield,
  UserCheck,
  ChevronRight,
  Lock,
  Eye,
  MessageCircle,
  FileText,
  Users,
  CheckCircle,
  Star,
  ArrowRight
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
              Secure Whistleblowing Platform
              <span className="block text-blue-600">for Modern Organizations</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Enable anonymous reporting with complete confidentiality. Our platform ensures 
              your organization can address misconduct safely while protecting whistleblower identities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/secure/tool">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
                  Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/secure/tool/report-status">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 border-gray-300 hover:bg-gray-50">
                  View Live Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Anonymous Reporting Encrypted</h3>
              <p className="text-gray-600 leading-relaxed">
                Submit reports completely anonymously with military-grade encryption protecting every submission.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Anonymous Hotline Solutions</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete hotline solutions for organizations of all sizes with 24/7 availability.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Case Management Platform</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive case management with secure communication and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Effective Whistleblowing</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Reporting Process</h3>
              <p className="text-gray-600 leading-relaxed">
                Simple, intuitive forms that make reporting misconduct straightforward and stress-free.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="bg-green-100 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Anonymous Submissions</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete anonymity with no personal information required or stored in our system.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="bg-purple-100 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Communication</h3>
              <p className="text-gray-600 leading-relaxed">
                Two-way encrypted messaging for safe follow-up while maintaining complete anonymity.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="bg-red-100 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customizable Forms</h3>
              <p className="text-gray-600 leading-relaxed">
                Tailor reporting forms to your organization's specific needs and requirements.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="bg-yellow-100 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Alerts</h3>
              <p className="text-gray-600 leading-relaxed">
                Instant notifications to designated personnel when new reports are submitted.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Case Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive dashboard for tracking, managing, and resolving reported incidents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Disclosurely Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Disclosurely Works</h2>
          </div>
          
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">1</div>
                  <h3 className="text-2xl font-bold text-gray-900">Submit a Report</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Use our secure, anonymous form to report misconduct. No personal information required - 
                  your identity remains completely protected throughout the process.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Anonymous submission</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Encrypted data transmission</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Secure file uploads</li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Anonymous Report Form</h4>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-20 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">2</div>
                  <h3 className="text-2xl font-bold text-gray-900">Secure Processing</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Your report is encrypted and securely processed. The organization receives notification 
                  of a new case without any identifying information about the reporter.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />End-to-end encryption</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Automated case assignment</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Instant notifications</li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Processing Pipeline</h4>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Lock className="h-6 w-6 text-blue-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">3</div>
                  <h3 className="text-2xl font-bold text-gray-900">Case Management</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Organization administrators can review, investigate, and manage cases through our 
                  secure dashboard while maintaining reporter anonymity throughout the process.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Secure case dashboard</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Team collaboration tools</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Complete audit trail</li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Management Dashboard</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">New Cases</span>
                        <span className="text-sm text-blue-600 font-semibold">3</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">In Progress</span>
                        <span className="text-sm text-yellow-600 font-semibold">7</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Resolved</span>
                        <span className="text-sm text-green-600 font-semibold">24</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">4</div>
                  <h3 className="text-2xl font-bold text-gray-900">Secure Communication</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  If follow-up is needed, secure two-way communication allows organizations to ask 
                  questions while the reporter maintains complete anonymity.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Anonymous messaging</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Encrypted conversations</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" />Secure file sharing</li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Secure Messaging</h4>
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs text-sm">
                          Can you provide more details about the incident?
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg max-w-xs text-sm">
                          Additional information provided anonymously...
                        </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Security & Compliance by Design</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built with enterprise-grade security and compliance standards from the ground up
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white/10 rounded-lg px-6 py-8 backdrop-blur">
                <div className="text-2xl font-bold text-white mb-2">GDPR</div>
                <div className="text-sm text-blue-100">Compliant</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg px-6 py-8 backdrop-blur">
                <div className="text-2xl font-bold text-white mb-2">ISO 27001</div>
                <div className="text-sm text-blue-100">Certified</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg px-6 py-8 backdrop-blur">
                <div className="text-2xl font-bold text-white mb-2">SOC 2</div>
                <div className="text-sm text-blue-100">Type II</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg px-6 py-8 backdrop-blur">
                <div className="text-2xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-blue-100">Available</div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 rounded-lg p-3 mr-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Advanced Encryption</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Military-grade AES-256 encryption protects all data in transit and at rest. 
                Your reports are secured with the same encryption used by government agencies.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 rounded-lg p-3 mr-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Compliance Ready</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Pre-configured to meet GDPR, SOC 2, and other regulatory requirements. 
                Complete audit trails and data governance built-in from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Disclosurely has transformed how we handle sensitive reports. The anonymous system 
                gives our employees confidence to speak up, and the dashboard makes case management seamless."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="font-semibold text-blue-600">SJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Chief Ethics Officer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "The security features are impressive. Our legal team was thoroughly satisfied with 
                the compliance standards and encryption protocols. It's exactly what we needed."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="font-semibold text-green-600">MP</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Michael Park</div>
                  <div className="text-sm text-gray-500">General Counsel</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Implementation was straightforward, and the support team was excellent. 
                We've seen a significant increase in reporting since switching to Disclosurely."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="font-semibold text-purple-600">AL</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Amanda Lee</div>
                  <div className="text-sm text-gray-500">HR Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Implement Secure Whistleblowing in Your Organization?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of organizations who trust Disclosurely to handle sensitive reports 
            with the highest levels of security and confidentiality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/secure/tool">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                View Live Demo
              </Button>
            </Link>
          </div>
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
