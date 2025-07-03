
import { Shield, Users, MessageSquare, Scale, Infinity, ArrowRight, Check, Star, Building, Globe, Award, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Link } from 'react-router-dom';
import AnonymousReportingArt from './artwork/AnonymousReportingArt';
import EncryptionArt from './artwork/EncryptionArt';
import SecureMessagingArt from './artwork/SecureMessagingArt';
import UnlimitedScaleArt from './artwork/UnlimitedScaleArt';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" 
                  alt="Disclosurely" 
                  className="h-6 sm:h-8 w-auto"
                />
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
            {/* Mobile Sign-in button */}
            <div className="md:hidden">
              <Link to="/auth/login" className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[150px] pb-20">
        <div className="text-center">
          {/* Blue lock icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wide">End to End Encryption</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Secure Disclosure and Whistleblowing Software
            <span className="block text-blue-600">for Modern Organisations</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Protect your organization with our secure, anonymous whistleblowing platform.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold">
              Start Free Trial
            </a>
            <div className="text-center">
              <Link to="/compliance-software" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-lg font-semibold">
                Learn about Compliance <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features with Artwork */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Built for Security, Designed for Trust
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Advanced features that protect whistleblowers and organizations
            </p>
          </div>

          <div className="space-y-16 sm:space-y-20">
            {/* Anonymous Reporting - Content > Image */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Anonymous Reporting</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-600 mb-6">
                  Complete anonymity protection for whistleblowers. Our advanced system ensures that reports can be submitted without revealing the identity of the reporter, providing a safe space for truth.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Zero-knowledge architecture
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    IP address protection
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Metadata removal
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <AnonymousReportingArt />
              </div>
            </div>

            {/* End-to-End Encryption - Image > Content */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-1">
                <EncryptionArt />
              </div>
              <div className="order-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">End-to-End Encryption</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-600 mb-6">
                  Military-grade AES-256 encryption protects all data. From submission to storage, your sensitive information remains secure and accessible only to authorized personnel.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    AES-256 encryption standard
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Encrypted file storage
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Secure key management
                  </li>
                </ul>
              </div>
            </div>

            {/* Secure Two-Way Messaging - Content > Image */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Secure Two-Way Messaging</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-600 mb-6">
                  Maintain anonymous communication throughout the investigation process. Ask questions, provide updates, and gather additional information while preserving anonymity.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Anonymous messaging
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Real-time notifications
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Message encryption
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <SecureMessagingArt />
              </div>
            </div>

            {/* Unlimited Scale - Image > Content */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-1">
                <UnlimitedScaleArt />
              </div>
              <div className="order-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Infinity className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Unlimited Scale</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-600 mb-6">
                  No restrictions on users, cases, or storage. Our platform grows with your organization, handling everything from small teams to enterprise-level deployments.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Unlimited users and cases
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Enterprise-grade infrastructure
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Global deployment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Simple steps to create a secure whistleblowing channel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Invite Users</h3>
                <p className="text-sm text-gray-600">Invite your team and stakeholders to the platform</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Customize Settings</h3>
                <p className="text-sm text-gray-600">Configure security and anonymity settings</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Launch Platform</h3>
                <p className="text-sm text-gray-600">Launch your secure whistleblowing platform</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Compliance & Security */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Compliance and Security
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                We take compliance and security seriously. Our platform is built to meet the highest standards.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">ISO 27001 Certified</h3>
                    <p className="text-gray-600 text-sm sm:text-base">International security standard certification</p>
                  </div>
                </li>

                <li className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">GDPR Compliant</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Built-in GDPR compliance and data protection</p>
                  </div>
                </li>

                <li className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Military-grade AES-256 encryption for all data</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <img
                src="/lovable-uploads/6929109d-546f-4997-a954-9999759f7e59.png"
                alt="Compliance"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials - Restored as Carousel */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
          </div>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <CardTitle className="flex items-center justify-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      Excellent Security
                    </CardTitle>
                    <CardDescription>Sarah M., Compliance Officer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      "Disclosurely's end-to-end encryption keeps our data safe. The platform is intuitive and our employees feel confident reporting issues."
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <CardTitle className="flex items-center justify-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      Easy to Use
                    </CardTitle>
                    <CardDescription>Michael R., HR Director</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      "The platform is user-friendly and easy to navigate. Our team was up and running within hours of setup."
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Award className="h-8 w-8 text-gray-400" />
                    </div>
                    <CardTitle className="flex items-center justify-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      Great Support
                    </CardTitle>
                    <CardDescription>Jennifer L., Legal Counsel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      "The support team is always available and quick to resolve any issues. Highly recommend for any organization."
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-gray-400" />
                    </div>
                    <CardTitle className="flex items-center justify-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      Comprehensive Solution
                    </CardTitle>
                    <CardDescription>David K., Risk Manager</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      "Finally, a whistleblowing solution that covers all our compliance needs while maintaining complete anonymity."
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Protect Your Organization?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join organizations worldwide who trust Disclosurely for secure whistleblowing.
          </p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            Start Free Trial
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/lovable-uploads/416d39db-53ff-402e-a2cf-26d1a3618601.png" 
                  alt="Disclosurely" 
                  className="h-6 sm:h-8 w-auto"
                />
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
