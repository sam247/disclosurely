import { Shield, Users, Lock, FileText, Bell, Star, Check, DollarSign, Globe, Eye, Award, Building2, MessageSquare, Database, UserCheck, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Link } from 'react-router-dom';

const Landing = () => {
  const reviews = [{
    id: 1,
    name: "Sarah Johnson",
    role: "Compliance Director, TechCorp",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c133?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Disclosurely has transformed how we handle sensitive reports. The platform is intuitive and our employees feel safe using it."
  }, {
    id: 2,
    name: "Michael Rodriguez",
    role: "CISO, Global Healthcare Inc",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The security features are outstanding. We can confidently assure our stakeholders that reports are handled with utmost care."
  }, {
    id: 3,
    name: "Lisa Chen",
    role: "HR Director, Financial Services LLC",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Implementation was seamless and the support team is exceptional. Best investment we've made in compliance technology."
  }, {
    id: 4,
    name: "David Thompson",
    role: "Chief Ethics Officer, Manufacturing Corp",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The anonymous reporting feature has significantly increased our reporting rates. Employees trust the system completely."
  }, {
    id: 5,
    name: "Emma Williams",
    role: "Risk Manager, Retail Solutions",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Disclosurely's compliance features saved us months of work. The automated reporting is a game-changer."
  }, {
    id: 6,
    name: "James Martinez",
    role: "Operations Director, Energy Corp",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The multi-language support and customization options make this perfect for our global operations."
  }, {
    id: 7,
    name: "Rachel Green",
    role: "Compliance Manager, Pharmaceutical Inc",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Outstanding platform with top-tier security. Our regulatory audits have never been smoother."
  }, {
    id: 8,
    name: "Robert Taylor",
    role: "General Counsel, Tech Startup",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "As a growing company, Disclosurely scales perfectly with our needs. Highly recommended for any organization."
  }];
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" alt="Disclosurely" className="h-6 sm:h-8 w-auto" />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link to="/compliance-software" className="text-gray-600 hover:text-gray-900">Compliance</Link>
              <Link to="/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link to="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-32 bg-gradient-to-br from-blue-50 to-white py-[150px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Secure Whistleblowing<br />
              <span className="text-blue-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Enable safe, anonymous reporting with end-to-end encryption. 
              Protect whistleblowers while maintaining compliance and building trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
              <Link to="/pricing" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Organizations Section - Moved up */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Organizations Worldwide
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              From startups to Fortune 500 companies, organizations trust Disclosurely
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Corporate</h3>
              <p className="text-sm text-gray-600">Large enterprises and multinational corporations</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Healthcare</h3>
              <p className="text-sm text-gray-600">Hospitals and healthcare organizations</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Government</h3>
              <p className="text-sm text-gray-600">Public sector and government agencies</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Non-Profit</h3>
              <p className="text-sm text-gray-600">NGOs and charitable organizations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anonymous Reporting Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Anonymous Reporting
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl px-4">
                Complete anonymity for whistleblowers with secure identity protection
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Anonymity</h3>
                    <p className="text-gray-600 text-sm sm:text-base">No personal information collected or stored during anonymous submissions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Identity Protection</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Advanced techniques to prevent identity discovery</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe Environment</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Create a culture where employees feel safe to speak up</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1556741533-f6acd643072a?w=600&h=400&fit=crop" alt="Anonymous reporting illustration" className="w-full h-96 object-cover" />
              <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* End-to-End Encrypted Communication Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop" alt="Encryption and security" className="w-full h-96 object-cover" />
              <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                End-to-End Encrypted Communication
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl px-4">
                Military-grade encryption protects all communications and data
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Military-Grade Security</h3>
                    <p className="text-gray-600 text-sm sm:text-base">AES-256 encryption ensures data cannot be intercepted or read</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero-Knowledge Architecture</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Even we cannot access your encrypted data without proper authorization</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure File Transfers</h3>
                    <p className="text-gray-600 text-sm sm:text-base">All attachments and documents are encrypted before transmission</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Two-Way Communication Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Secure Two-Way Communication
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl px-4">
                Enable ongoing dialogue while maintaining anonymity and security
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Anonymous Messaging</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Secure chat system preserves whistleblower anonymity</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Instant notifications for new messages and case updates</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Management</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Track case progress and maintain communication history</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1553484771-047a44eee27a?w=600&h=400&fit=crop" alt="Secure communication" className="w-full h-96 object-cover" />
              <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlimited Scale Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" alt="Scalable platform" className="w-full h-96 object-cover" />
              <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Unlimited Scale
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl px-4">
                No artificial limits on cases, files, categories, or users
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scalable Infrastructure</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Handle thousands of cases without performance degradation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Ready</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Support for large organizations with thousands of employees</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Deployment</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Worldwide infrastructure ensures fast, reliable access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section with Carousel */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />)}
              <span className="ml-2 text-gray-600 text-sm sm:text-base">4.9/5 from 2,400+ reviews</span>
            </div>
          </div>

          <div className="relative">
            <Carousel opts={{
            align: "start",
            loop: true
          }} className="w-full max-w-6xl mx-auto">
              <CarouselContent>
                {reviews.map(review => <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="bg-white h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-1 mb-4">
                          {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                        </div>
                        <p className="text-gray-600 mb-4 text-sm sm:text-base">
                          "{review.text}"
                        </p>
                        <div className="flex items-center space-x-3">
                          <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                            <p className="text-gray-500 text-xs">{review.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Secure Your Organization?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join organizations worldwide who trust Disclosurely for secure whistleblowing.
          </p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            Get Started Today
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/lovable-uploads/416d39db-53ff-402e-a2cf-26d1a3618601.png" alt="Disclosurely" className="h-6 sm:h-8 w-auto" />
              </div>
              <p className="text-gray-400 mb-4">
                Secure whistleblowing platform for organizations. Anonymous reporting, 
                end-to-end encryption, and compliance features.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link to="/compliance-software" className="text-gray-400 hover:text-white">Compliance Software</Link></li>
                <li><Link to="/vs-whistleblower-software" className="text-gray-400 hover:text-white">Disclosurely vs Whistleblower Software</Link></li>
                <li><Link to="/vs-speak-up" className="text-gray-400 hover:text-white">Disclosurely vs Speak Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/auth/login" className="text-gray-400 hover:text-white">Sign In</Link></li>
                <li><Link to="/auth/signup" className="text-gray-400 hover:text-white">Get Started</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Disclosurely. All rights reserved. <Link to="/compliance-software" className="hover:text-white">Compliance Software</Link>. Powered by <a href="https://betterranking.co.uk/?utm_source=footer&utm_medium=internal&utm_campaign=disclosurely&utm_id=links" target="_blank" rel="noopener noreferrer" className="hover:text-white">Better Ranking</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
