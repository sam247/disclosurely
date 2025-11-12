import React from 'react';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import {
  Landmark,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Lock,
  Scale
} from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Link } from 'react-router-dom';

const IndustriesFinance: React.FC = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;

  const commonReportTypes = [
    { name: 'Financial Fraud', severity: 'Critical', regulation: 'SOX' },
    { name: 'Insider Trading', severity: 'Critical', regulation: 'SEC' },
    { name: 'Money Laundering', severity: 'Critical', regulation: 'AML' },
    { name: 'Accounting Irregularities', severity: 'High', regulation: 'SOX' },
    { name: 'Market Manipulation', severity: 'High', regulation: 'SEC' },
    { name: 'Conflicts of Interest', severity: 'Medium', regulation: 'Compliance' },
    { name: 'KYC Violations', severity: 'High', regulation: 'AML' },
    { name: 'Regulatory Breaches', severity: 'High', regulation: 'Various' }
  ];

  const features = [
    {
      icon: FileCheck,
      title: 'SOX Compliance Built-In',
      description: 'Pre-configured for Sarbanes-Oxley requirements with automated audit trails, chain verification, and comprehensive documentation for auditors.'
    },
    {
      icon: Lock,
      title: 'Bank-Grade Security',
      description: 'Military-grade AES-GCM encryption, zero-knowledge architecture, and secure data storage that meets financial industry standards.'
    },
    {
      icon: Shield,
      title: 'Anonymous Whistleblowing',
      description: 'Financial employees can report fraud, insider trading, and accounting irregularities without revealing their identity.'
    },
    {
      icon: Scale,
      title: 'Regulatory Compliance',
      description: 'Meet SEC, FINRA, FCA, and global financial regulatory requirements with comprehensive audit trails and documentation.'
    },
    {
      icon: TrendingUp,
      title: 'AI Fraud Detection',
      description: 'DeepSeek AI identifies patterns across multiple reports, helping detect systemic fraud before it escalates.'
    },
    {
      icon: AlertTriangle,
      title: 'Rapid Escalation',
      description: 'Critical financial fraud reports are automatically escalated to Legal, Compliance, and Executive teams within minutes.'
    }
  ];

  const complianceStandards = [
    { name: 'SOX', description: 'Sarbanes-Oxley Act' },
    { name: 'SEC', description: 'Securities & Exchange Commission' },
    { name: 'FINRA', description: 'Financial Industry Regulatory Authority' },
    { name: 'AML', description: 'Anti-Money Laundering' },
    { name: 'KYC', description: 'Know Your Customer' },
    { name: 'GDPR', description: 'General Data Protection Regulation' },
    { name: 'FCA', description: 'Financial Conduct Authority (UK)' },
    { name: 'MiFID II', description: 'Markets in Financial Instruments Directive' }
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/industries/finance"
        fallbackTitle="Finance Whistleblowing | SOX Compliant"
        fallbackDescription="SOX-compliant fraud reporting for banks and financial institutions. Detect insider trading, money laundering, and accounting fraud early."
      />

      <StandardHeader currentLanguage={currentLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Landmark className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              SOX-Compliant Whistleblowing for Financial Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Secure, anonymous reporting platform designed for banks, investment firms, and financial institutions. Detect fraud early, stay compliant, protect your reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`${langPrefix}/auth/signup`}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Start Free Trial
              </Link>
              <Link
                to={`${langPrefix}/contact`}
                className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Schedule Demo
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">7-day free trial • SOX, SEC & FINRA compliant</p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">
        {/* Financial Industry Risks */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Cost of Financial Fraud
              </h2>
              <p className="text-lg text-gray-600">
                Financial services face unique compliance and fraud detection challenges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">$42B</div>
                <div className="text-sm text-gray-600">Annual financial fraud losses globally</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">60%</div>
                <div className="text-sm text-gray-600">Financial fraud detected by whistleblowers</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">$25M</div>
                <div className="text-sm text-gray-600">Average SOX non-compliance penalty</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">18mo</div>
                <div className="text-sm text-gray-600">Average fraud detection time without hotline</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built for Financial Services Compliance
              </h2>
              <p className="text-lg text-gray-600">
                Not just compliant—designed specifically for financial fraud detection
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

        {/* Compliance Standards */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Regulatory Compliance
              </h2>
              <p className="text-lg text-gray-600">
                Pre-configured for global financial regulations and standards
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {complianceStandards.map((standard, index) => (
                <Card key={index} className="p-4 text-center hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="font-bold text-gray-900 mb-1">{standard.name}</div>
                  <div className="text-xs text-gray-600">{standard.description}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Common Report Types */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pre-Configured Financial Report Categories
              </h2>
              <p className="text-lg text-gray-600">
                Start reporting immediately with categories designed for financial compliance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {commonReportTypes.map((report, index) => (
                <Card key={index} className="p-4">
                  <div className="flex flex-col">
                    <div className="font-semibold text-gray-900 mb-2">{report.name}</div>
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        report.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        report.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.severity}
                      </div>
                      <div className="text-xs text-gray-600">{report.regulation}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Case Example */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Real-World Financial Fraud Scenario
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  A senior analyst discovers irregularities in quarterly financial statements. She suspects accounting fraud but fears career retaliation from the CFO.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Secure Anonymous Report</div>
                      <div className="text-gray-600">Submits detailed evidence through Disclosurely's encrypted portal, maintaining complete anonymity.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Critical Escalation</div>
                      <div className="text-gray-600">AI flags as critical. Report automatically routed to General Counsel, Audit Committee, and Board of Directors.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Independent Investigation</div>
                      <div className="text-gray-600">External auditors engaged. Two-way secure messaging allows follow-up questions while protecting whistleblower identity.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Resolution & Compliance</div>
                      <div className="text-gray-600">Fraud prevented, controls strengthened, SOX compliance maintained. Complete audit trail for regulators.</div>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="p-8 bg-white border-2 border-gray-200 shadow-xl">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Financial Fraud Alert</div>
                      <div className="text-sm text-gray-600">DIS-FIN-8921</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Category</div>
                    <div className="font-semibold text-gray-900">Accounting Irregularities</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Severity</div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                      Critical - SOX Violation
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Escalated To</div>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">• General Counsel</div>
                      <div className="font-semibold text-gray-900">• Audit Committee</div>
                      <div className="font-semibold text-gray-900">• Board of Directors</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">AI Risk Assessment</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-red-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full" style={{ width: '95%' }}></div>
                      </div>
                      <div className="text-sm font-semibold text-red-600">95%</div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold">
                    <Lock className="w-4 h-4" />
                    SOX Compliant • Anonymous • Bank-Grade Encryption
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
              Detect Fraud Early, Stay Compliant, Protect Your Reputation
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your SOX-compliant whistleblowing platform in 5 minutes. No lengthy implementations, no compliance delays, transparent pricing.
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
            <p className="text-blue-100 text-sm mt-4">Trusted by banks, investment firms, and financial institutions globally</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default IndustriesFinance;
