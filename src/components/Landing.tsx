
import React from 'react';
import { Shield, Lock, Users, FileText, Eye, Award, Check, ArrowRight, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Import artwork components
import AnonymousReportingArt from '@/components/artwork/AnonymousReportingArt';
import EncryptionArt from '@/components/artwork/EncryptionArt';
import ComplianceArt from '@/components/artwork/ComplianceArt';
import SecureMessagingArt from '@/components/artwork/SecureMessagingArt';
import UnlimitedScaleArt from '@/components/artwork/UnlimitedScaleArt';

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
                  className="h-6 md:h-8 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <a href="https://app.disclosurely.com/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</a>
              <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </div>
            <div className="md:hidden">
              <a href="https://app.disclosurely.com/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[150px] pb-20 md:pb-[100px]">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Secure Whistleblowing Platform
            <span className="block text-blue-600">for Organizations</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Anonymous reporting, end-to-end encryption, and compliance features. 
            Create a safe space for your team to report issues confidentially.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold">
              Start Free Trial
            </a>
            <Link to="/pricing" className="border border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 sm:py-20 md:py-[100px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Secure Reporting
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Comprehensive whistleblowing solution with advanced security and compliance features
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Anonymous Reporting</CardTitle>
                <CardDescription>
                  Complete anonymity protection with secure submission channels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>End-to-End Encryption</CardTitle>
                <CardDescription>
                  Military-grade encryption keeps all reports and communications secure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Case Management</CardTitle>
                <CardDescription>
                  Streamlined workflow for investigating and resolving reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Compliance Ready</CardTitle>
                <CardDescription>
                  Built-in compliance features for regulations and standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete audit logs for transparency and accountability
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Expert support team available around the clock
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Detailed Features Section */}
      <div className="bg-white py-16 sm:py-20 md:py-[100px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 sm:space-y-20 md:space-y-[100px]">
            {/* Anonymous Reporting */}
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Anonymous Reporting Made Simple
                </h3>
                <p className="text-base sm:text-lg text-gray-600">
                  Enable your team to report issues without fear. Our platform ensures complete anonymity 
                  while maintaining the ability to investigate and resolve concerns effectively.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Zero personal information required</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Secure tracking system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Two-way anonymous communication</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 rounded-lg">
                <AnonymousReportingArt />
              </div>
            </div>

            {/* Encryption */}
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 sm:p-8 rounded-lg order-2 md:order-1">
                <EncryptionArt />
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Military-Grade Encryption
                </h3>
                <p className="text-base sm:text-lg text-gray-600">
                  Every report is protected with AES-256 encryption. Your data remains secure 
                  from submission to resolution, with no possibility of unauthorized access.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">AES-256 encryption standard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Encrypted file attachments</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Secure key management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Compliance Made Easy
                </h3>
                <p className="text-base sm:text-lg text-gray-600">
                  Built-in features to help you meet regulatory requirements including SOX, 
                  GDPR, and industry-specific compliance standards.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">SOX compliance ready</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">GDPR data protection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Audit trail reporting</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 sm:p-8 rounded-lg">
                <ComplianceArt />
              </div>
            </div>

            {/* Secure Messaging */}
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 sm:p-8 rounded-lg order-2 md:order-1">
                <SecureMessagingArt />
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Secure Two-Way Communication
                </h3>
                <p className="text-base sm:text-lg text-gray-600">
                  Enable secure communication between whistleblowers and investigators 
                  without compromising anonymity. Ask follow-up questions and provide updates safely.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Anonymous messaging system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Real-time notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Encrypted message history</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Case Helper */}
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  AI-Powered Case Analysis
                </h3>
                <p className="text-base sm:text-lg text-gray-600">
                  Our advanced AI Case Helper analyzes reports for policy compliance, 
                  suggests investigation steps, and identifies potential risks automatically.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Automated policy compliance checking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Smart investigation recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Risk assessment and prioritization</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-100 p-6 sm:p-8 rounded-lg">
                <div className="w-full h-64 flex items-center justify-center">
                  <svg width="200" height="160" viewBox="0 0 200 160" className="drop-shadow-lg">
                    {/* AI Brain */}
                    <circle cx="100" cy="80" r="50" stroke="#8B5CF6" strokeWidth="3" fill="none" opacity="0.8" />
                    <circle cx="100" cy="80" r="35" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.6" />
                    <circle cx="100" cy="80" r="20" stroke="#C084FC" strokeWidth="2" fill="none" opacity="0.4" />
                    
                    {/* Neural connections */}
                    <g stroke="#8B5CF6" strokeWidth="1.5" opacity="0.7">
                      <line x1="70" y1="60" x2="85" y2="70" />
                      <line x1="130" y1="60" x2="115" y2="70" />
                      <line x1="70" y1="100" x2="85" y2="90" />
                      <line x1="130" y1="100" x2="115" y2="90" />
                    </g>
                    
                    {/* Data nodes */}
                    <g fill="#8B5CF6" opacity="0.8">
                      <circle cx="60" cy="50" r="6" />
                      <circle cx="140" cy="50" r="6" />
                      <circle cx="60" cy="110" r="6" />
                      <circle cx="140" cy="110" r="6" />
                      <circle cx="100" cy="30" r="6" />
                      <circle cx="100" cy="130" r="6" />
                    </g>
                    
                    {/* Analysis waves */}
                    <g stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.6">
                      <path d="M20 80 Q40 60, 60 80 T100 80 T140 80 T180 80" />
                      <path d="M20 90 Q40 70, 60 90 T100 90 T140 90 T180 90" />
                      <path d="M20 70 Q40 50, 60 70 T100 70 T140 70 T180 70" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-16 sm:py-20 md:py-[100px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Choose the plan that fits your organization's needs. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl font-bold mb-2">Starter</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  £19.99<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <CardDescription>Perfect for small teams getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">5 cases/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">1GB Storage</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Email Support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-500">Secure two-way Messaging</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-500">AI Case Helper</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-500">Custom branding</span>
                  </li>
                </ul>
                <a href="https://app.disclosurely.com/auth/signup" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-center block">
                  Start Free Trial
                </a>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-600 shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl font-bold mb-2">Pro</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  £49.99<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <CardDescription>Advanced features for growing organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited cases/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited storage</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Email Support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Secure two-way Messaging</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">AI Case Helper</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Custom branding</span>
                  </li>
                </ul>
                <a href="https://app.disclosurely.com/auth/signup" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-center block">
                  Start Free Trial
                </a>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl font-bold mb-2">Enterprise</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  Custom<span className="text-lg font-normal text-gray-600"> pricing</span>
                </div>
                <CardDescription>Tailored solutions for large organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Everything in Pro</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Custom integrations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">24/7 phone support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">SLA guarantee</span>
                  </li>
                </ul>
                <Link to="/contact" className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 text-center block">
                  Contact Sales
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16 sm:py-20 md:py-[100px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Organizations Worldwide
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              See what our customers say about their experience with Disclosurely
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Disclosurely has transformed how we handle sensitive reports. The anonymous 
                  messaging feature is particularly valuable for our organization."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=40&h=40&fit=crop&crop=face"
                    alt="Sarah Johnson"
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">HR Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The platform is intuitive and secure. Our employees feel confident 
                  reporting issues, and we can investigate them effectively."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=40&h=40&fit=crop&crop=face"
                    alt="Michael Chen"
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Michael Chen</p>
                    <p className="text-sm text-gray-600">Compliance Officer, FinanceGlobal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Implementation was seamless and the support team was excellent. 
                  Highly recommend for any organization serious about compliance."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=40&h=40&fit=crop&crop=face"
                    alt="Emily Rodriguez"
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                    <p className="text-sm text-gray-600">Legal Director, ManufacturingPlus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16 md:py-[100px]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Create a Safer Workplace?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Join thousands of organizations who trust Disclosurely for their whistleblowing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center justify-center">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <Link to="/pricing" className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/lovable-uploads/416d39db-53ff-402e-a2cf-26d1a3618601.png" 
                  alt="Disclosurely" 
                  className="h-6 md:h-8 w-auto"
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
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Data Protection</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><a href="https://app.disclosurely.com/auth/login" className="text-gray-400 hover:text-white">Sign In</a></li>
                <li><a href="https://app.disclosurely.com/auth/signup" className="text-gray-400 hover:text-white">Get Started</a></li>
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
