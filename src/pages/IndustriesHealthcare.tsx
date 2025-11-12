import React from 'react';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Shield,
  FileCheck,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Link } from 'react-router-dom';

const IndustriesHealthcare: React.FC = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;

  const commonReportTypes = [
    { name: 'Patient Safety Concerns', severity: 'High' },
    { name: 'HIPAA Violations', severity: 'Critical' },
    { name: 'Medical Malpractice', severity: 'High' },
    { name: 'Billing Fraud', severity: 'High' },
    { name: 'Workplace Harassment', severity: 'Medium' },
    { name: 'Equipment Safety Issues', severity: 'High' },
    { name: 'Prescription Errors', severity: 'Critical' },
    { name: 'Staff Misconduct', severity: 'Medium' }
  ];

  const features = [
    {
      icon: Lock,
      title: 'HIPAA-Compliant Architecture',
      description: 'End-to-end encryption, secure data storage, and full BAA (Business Associate Agreement) compliance to protect PHI (Protected Health Information).'
    },
    {
      icon: FileCheck,
      title: 'Patient Safety First',
      description: 'Pre-configured categories for patient safety concerns, with automated escalation for critical issues that require immediate attention.'
    },
    {
      icon: Shield,
      title: 'Anonymous Reporting',
      description: 'Healthcare workers can report concerns without fear of retaliation, protecting their identity while ensuring patient safety.'
    },
    {
      icon: Clock,
      title: 'Rapid Response SLAs',
      description: 'Automated SLA management ensures critical patient safety issues are acknowledged within hours, not days.'
    },
    {
      icon: Users,
      title: 'Multi-Department Routing',
      description: 'Automatically route reports to the right department: Patient Safety, Quality Assurance, HR, Legal, or Administration.'
    },
    {
      icon: AlertTriangle,
      title: 'Regulatory Compliance',
      description: 'Meet Joint Commission, CMS, and state healthcare compliance requirements with comprehensive audit trails.'
    }
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/industries/healthcare"
        fallbackTitle="Healthcare Whistleblowing | HIPAA Compliant"
        fallbackDescription="HIPAA-compliant reporting for hospitals and clinics. Secure patient safety concerns, medical malpractice, and billing fraud reporting."
      />

      <StandardHeader currentLanguage={currentLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              HIPAA-Compliant Whistleblowing for Healthcare
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Secure, anonymous reporting platform designed specifically for hospitals, clinics, and healthcare organizations. Protect patients, protect staff, stay compliant.
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
            <p className="text-sm text-gray-500 mt-4">7-day free trial • HIPAA-compliant</p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">
        {/* Healthcare Challenges */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Healthcare-Specific Compliance Challenges
              </h2>
              <p className="text-lg text-gray-600">
                The healthcare industry faces unique reporting requirements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">$50K</div>
                <div className="text-sm text-gray-600">Average HIPAA violation fine</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">72%</div>
                <div className="text-sm text-gray-600">Healthcare workers witness misconduct</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">250K</div>
                <div className="text-sm text-gray-600">Annual patient deaths from medical errors</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">45%</div>
                <div className="text-sm text-gray-600">Fear retaliation for reporting</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built for Healthcare Compliance
              </h2>
              <p className="text-lg text-gray-600">
                Not just HIPAA-compliant—designed specifically for healthcare reporting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="w-8 h-8 text-red-600" />
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

        {/* Common Report Types */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pre-Configured Healthcare Report Categories
              </h2>
              <p className="text-lg text-gray-600">
                Start reporting immediately with categories designed for healthcare compliance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {commonReportTypes.map((report, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">{report.name}</div>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        report.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        report.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.severity}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Case Example */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Real-World Healthcare Scenario
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  A nurse notices a pattern of medication errors in the ICU. She wants to report it, but fears retaliation from the attending physician.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Anonymous Submission</div>
                      <div className="text-gray-600">She submits the concern through Disclosurely's anonymous portal, providing detailed evidence.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Automated Escalation</div>
                      <div className="text-gray-600">The system automatically routes to Patient Safety Officer and Quality Assurance, marking as high-priority.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Immediate Action</div>
                      <div className="text-gray-600">Investigation begins within 2 hours. Two-way messaging allows follow-up questions while maintaining anonymity.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Resolution & Documentation</div>
                      <div className="text-gray-600">Issue resolved, procedures updated, staff retrained. Full audit trail for Joint Commission compliance.</div>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="p-8 bg-gray-50 border-2 border-gray-200">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Patient Safety Report</div>
                      <div className="text-sm text-gray-600">DIS-HC-2847</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Category</div>
                    <div className="font-semibold text-gray-900">Medication Errors - ICU</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Severity</div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                      Critical
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Status</div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                      Under Investigation
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Assigned To</div>
                    <div className="font-semibold text-gray-900">Patient Safety Officer</div>
                    <div className="text-sm text-gray-600">Quality Assurance Team</div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    HIPAA Compliant • Anonymous • Secure
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
              Protect Patients, Protect Staff, Stay Compliant
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your HIPAA-compliant whistleblowing platform in 5 minutes. No technical setup, no BAA delays, no hidden fees.
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
            <p className="text-blue-100 text-sm mt-4">Trusted by hospitals, clinics, and healthcare organizations worldwide</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default IndustriesHealthcare;
