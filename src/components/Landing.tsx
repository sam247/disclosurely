
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, MessageSquare, Eye, Users, Star, ArrowRight, CheckCircle, Globe, Zap, FileText, UserCheck, Clock, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnonymousReportingArt from './artwork/AnonymousReportingArt';
import SecureMessagingArt from './artwork/SecureMessagingArt';
import EncryptionArt from './artwork/EncryptionArt';
import UnlimitedScaleArt from './artwork/UnlimitedScaleArt';
import ComplianceArt from './artwork/ComplianceArt';

const Landing = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Anonymous Reporting",
      description: "Complete anonymity with zero tracking or data collection from whistleblowers.",
      component: <AnonymousReportingArt />
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      title: "Secure Messaging",
      description: "End-to-end encrypted communication between whistleblowers and your organization.",
      component: <SecureMessagingArt />
    },
    {
      icon: <Lock className="h-8 w-8 text-purple-600" />,
      title: "Military-Grade Encryption",
      description: "AES-256 encryption ensures all data remains completely secure and private.",
      component: <EncryptionArt />
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-600" />,
      title: "Unlimited Scale",
      description: "Handle thousands of reports with enterprise-grade infrastructure and reliability.",
      component: <UnlimitedScaleArt />
    }
  ];

  const complianceFeatures = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      title: "GDPR Compliant",
      description: "Full compliance with European data protection regulations"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "ISO 27001",
      description: "Information security management system certified"
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      title: "SOC 2 Type II",
      description: "Rigorous security and availability controls audited"
    },
    {
      icon: <Globe className="h-6 w-6 text-orange-600" />,
      title: "Global Standards",
      description: "Meets international whistleblower protection requirements"
    }
  ];

  const dashboardFeatures = [
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: "Real-time Analytics",
      description: "Track report trends, response times, and resolution rates with comprehensive dashboards."
    },
    {
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      title: "Case Management",
      description: "Assign cases, set priorities, track progress, and collaborate with your team efficiently."
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      title: "Automated Workflows",
      description: "Set up automatic notifications, escalations, and reminders to ensure no case is missed."
    },
    {
      icon: <Shield className="h-6 w-6 text-orange-600" />,
      title: "Audit Trail",
      description: "Complete audit logging of all actions and changes for compliance and accountability."
    }
  ];

  const reviews = [
    {
      name: "Sarah Johnson",
      role: "Compliance Director",
      company: "TechCorp Industries",
      rating: 5,
      review: "Disclosurely has transformed our whistleblower program. The anonymous reporting feature gives our employees confidence to speak up, and the secure messaging keeps everything confidential.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e88263?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Chief Ethics Officer",
      company: "Global Finance Ltd",
      rating: 5,
      review: "The encryption and security features are top-notch. We've seen a 300% increase in reports since implementing Disclosurely, and our legal team loves the compliance features.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "HR Director",
      company: "Manufacturing Plus",
      rating: 5,
      review: "The case management system is incredibly intuitive. We can track every report from submission to resolution, and the automated workflows save us hours each week.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "David Park",
      role: "Risk Manager",
      company: "Healthcare Solutions",
      rating: 5,
      review: "Disclosurely's GDPR compliance features were exactly what we needed for our European operations. The team was incredibly helpful during implementation.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Lisa Thompson",
      role: "Internal Audit Lead",
      company: "Energy Corp",
      rating: 5,
      review: "The audit trail and reporting capabilities are exceptional. We can generate compliance reports in minutes instead of hours, and the data insights help us improve our processes.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Disclosurely</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link to="/compliance-software" className="text-gray-600 hover:text-gray-900 transition-colors">Compliance</Link>
              <Link to="/vs-whistleblower-software" className="text-gray-600 hover:text-gray-900 transition-colors">Compare</Link>
              <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Login</Link>
              <Link to="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <Lock className="h-1.5 w-1.5" />
              <span>End to End Encryption</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Secure Whistleblower <br />
            <span className="text-blue-600">Reporting Platform</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Empower your organization with anonymous reporting, secure messaging, and comprehensive case management. 
            Build trust, ensure compliance, and protect whistleblowers with military-grade encryption.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/secure/tool">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Submit Anonymous Report
                <Eye className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>14-Day Free Trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Secure Reporting</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built from the ground up with security, compliance, and user experience in mind. 
              Our platform provides all the tools you need to create a safe environment for whistleblowers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {features.map((feature, index) => (
              <div key={index} className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      {feature.icon}
                      <CardTitle className="text-2xl font-bold text-gray-900">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">{feature.description}</p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                      {feature.component}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Management Dashboard</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your workflow with our comprehensive case management system designed for compliance teams and investigators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dashboardFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    {feature.icon}
                    <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Compliance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the highest standards of data protection and regulatory compliance with our certified security framework.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complianceFeatures.map((feature, index) => (
                  <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3 mb-2">
                        {feature.icon}
                        <CardTitle className="text-lg font-semibold text-gray-900">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl">
              <ComplianceArt />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Compliance Teams Worldwide</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of organizations that trust Disclosurely to protect their whistleblowers and maintain compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 3).map((review, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={review.avatar} 
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-600">{review.role}</p>
                      <p className="text-sm text-gray-500">{review.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">"{review.review}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.slice(3).map((review, index) => (
              <Card key={index + 3} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={review.avatar} 
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-600">{review.role}</p>
                      <p className="text-sm text-gray-500">{review.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">"{review.review}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Build Trust in Your Organization?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see how Disclosurely can transform your whistleblower program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Disclosurely</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The most secure and compliant whistleblower reporting platform for modern organizations.
              </p>
              <div className="flex space-x-4">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">GDPR Compliant</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">ISO 27001</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">SOC 2</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/compliance-software" className="hover:text-white transition-colors">Compliance</Link></li>
                <li><Link to="/vs-whistleblower-software" className="hover:text-white transition-colors">Comparisons</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/secure/tool" className="hover:text-white transition-colors">Submit Report</Link></li>
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
