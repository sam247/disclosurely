import React from 'react';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import {
  Phone,
  Shield,
  MessageSquare,
  Lock,
  CheckCircle,
  Users,
  Clock,
  FileText,
  Globe,
  Smartphone
} from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Link } from 'react-router-dom';

const AnonymousHotline: React.FC = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;

  const features = [
    {
      icon: Shield,
      title: '100% Anonymous',
      description: 'Zero-knowledge architecture means even we cannot identify whistleblowers. Complete anonymity guaranteed.'
    },
    {
      icon: MessageSquare,
      title: 'Two-Way Messaging',
      description: 'Ask follow-up questions and get updates while maintaining anonymity. No need to reveal identity for communication.'
    },
    {
      icon: Lock,
      title: 'Military-Grade Encryption',
      description: 'AES-GCM encryption protects every report. Data encrypted at rest and in transit.'
    },
    {
      icon: Globe,
      title: '24/7 Availability',
      description: 'Submit reports anytime, anywhere. Mobile-optimized for reporting on the go.'
    },
    {
      icon: FileText,
      title: 'Evidence Upload',
      description: 'Securely attach photos, documents, screenshots, and other evidence to support your report.'
    },
    {
      icon: Clock,
      title: 'Instant Confirmation',
      description: 'Receive a unique tracking ID immediately to check status and communicate with investigators.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Access the Portal',
      description: 'Visit your organization\'s secure reporting portal from any device - desktop, mobile, or tablet.'
    },
    {
      step: 2,
      title: 'Submit Your Report',
      description: 'Describe what happened, provide details, and upload evidence. No personal information required.'
    },
    {
      step: 3,
      title: 'Get Tracking ID',
      description: 'Receive a unique tracking code to check status and communicate anonymously.'
    },
    {
      step: 4,
      title: 'Two-Way Communication',
      description: 'Investigators can ask follow-up questions. You can provide updates. All while staying anonymous.'
    },
    {
      step: 5,
      title: 'Track Progress',
      description: 'Use your tracking ID to see investigation status and receive updates on resolution.'
    }
  ];

  const useCases = [
    { title: 'Workplace Harassment', icon: Users },
    { title: 'Financial Fraud', icon: FileText },
    { title: 'Safety Violations', icon: Shield },
    { title: 'Discrimination', icon: Users },
    { title: 'Ethics Violations', icon: CheckCircle },
    { title: 'Retaliation Concerns', icon: Shield }
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/anonymous-hotline"
        fallbackTitle="Anonymous Whistleblower Hotline | Disclosurely"
        fallbackDescription="24/7 anonymous hotline with two-way messaging. Report workplace misconduct securely without revealing your identity. 100% confidential."
      />

      <StandardHeader currentLanguage={currentLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Anonymous Whistleblower Hotline
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Speak up safely. Report workplace misconduct 24/7 without revealing your identity. Two-way communication keeps you anonymous throughout the investigation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`${langPrefix}/auth/signup`}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Set Up Your Hotline
              </Link>
              <Link
                to="/report"
                className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Submit Anonymous Report
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">100% Anonymous • 24/7 Availability • No Software to Install</p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">
        {/* Why Anonymous Reporting Matters */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Anonymity Matters
              </h2>
              <p className="text-lg text-gray-600">
                Fear of retaliation is the #1 reason employees don't report misconduct
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">82%</div>
                <div className="text-sm text-gray-600">Fear retaliation for reporting</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">5x</div>
                <div className="text-sm text-gray-600">More likely to report anonymously</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">67%</div>
                <div className="text-sm text-gray-600">Fraud detected by whistleblowers</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">$12K</div>
                <div className="text-sm text-gray-600">Saved per employee with hotline</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Complete Anonymity, Complete Control
              </h2>
              <p className="text-lg text-gray-600">
                Our hotline protects whistleblower identity while enabling effective investigations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                How Anonymous Reporting Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple 5-step process keeps you anonymous throughout the investigation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {howItWorks.map((item, index) => (
                <div key={index} className="relative">
                  <Card className="p-6 h-full">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 text-center">
                      {item.description}
                    </p>
                  </Card>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-blue-200 z-10"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Can You Report Anonymously?
              </h2>
              <p className="text-lg text-gray-600">
                Our hotline handles all types of workplace misconduct
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => {
                const IconComponent = useCase.icon;
                return (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {useCase.title}
                      </h3>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Anonymous Two-Way Communication
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Unlike traditional phone hotlines, Disclosurely enables secure two-way messaging while protecting your anonymity. Investigators can ask follow-up questions, and you can provide updates—all without revealing your identity.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">No Phone Calls Required</div>
                      <div className="text-gray-600">Submit reports via secure web form, not recorded phone lines</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Evidence Upload</div>
                      <div className="text-gray-600">Attach photos, documents, and screenshots securely</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Status Tracking</div>
                      <div className="text-gray-600">Check investigation progress with your tracking ID</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Mobile Optimized</div>
                      <div className="text-gray-600">Report from any device, anywhere</div>
                    </div>
                  </li>
                </ul>
              </div>
              <Card className="p-8 bg-white border-2 border-gray-200 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Anonymous Conversation</div>
                      <div className="text-sm text-gray-600">Tracking ID: DIS-X7K2P9</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 mb-1">You (Anonymous) • 2 days ago</div>
                    <div className="text-sm text-gray-900">I witnessed financial irregularities in Q3 reporting. I have supporting documents but fear retaliation.</div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 mb-1">Compliance Team • 1 day ago</div>
                    <div className="text-sm text-gray-900">Thank you for reporting. Your identity is protected. Can you provide more details about the specific accounts involved?</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 mb-1">You (Anonymous) • 12 hours ago</div>
                    <div className="text-sm text-gray-900">Yes, I've uploaded the relevant spreadsheets. See attached files.</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span>Q3_Report_Evidence.xlsx</span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                    <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                      <Lock className="w-4 h-4" />
                      End-to-End Encrypted • 100% Anonymous
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Set Up Your Anonymous Hotline in 5 Minutes
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              No phone lines to set up, no hardware to install, no IT expertise required. Get your anonymous whistleblower hotline running today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to={`${langPrefix}/auth/signup`}
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Start Free Trial
              </Link>
              <Link
                to={`${langPrefix}/pricing`}
                className="inline-flex items-center px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold border border-blue-500"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-blue-100 text-sm mt-4">£39.99/month • No hidden fees • Cancel anytime</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AnonymousHotline;
