import React from 'react';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Lock,
  Key,
  Server,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Cloud,
  Database,
  Eye,
  Fingerprint,
  Globe
} from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Link } from 'react-router-dom';

const Security: React.FC = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;

  const securityFeatures = [
    {
      icon: Lock,
      title: 'AES-256-GCM Encryption',
      description: 'Military-grade encryption for all data at rest and in transit. Same encryption used by governments and financial institutions.'
    },
    {
      icon: Key,
      title: 'Zero-Knowledge Architecture',
      description: 'We cannot decrypt your reports. Only authorized users in your organization with proper permissions can access submitted reports.'
    },
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'Reports are encrypted on the whistleblower\'s device before transmission. Decrypted only within your organization\'s secure environment.'
    },
    {
      icon: Fingerprint,
      title: 'Multi-Factor Authentication',
      description: 'Required for all admin accounts. Additional security layer to prevent unauthorized access to reports.'
    },
    {
      icon: Eye,
      title: 'Role-Based Access Control',
      description: 'Granular permissions ensure only authorized team members can view specific reports. Full audit trail of all access.'
    },
    {
      icon: Server,
      title: 'Secure Cloud Infrastructure',
      description: 'Hosted on enterprise-grade cloud infrastructure with 99.99% uptime SLA. Regular security audits and penetration testing.'
    },
    {
      icon: Database,
      title: 'Encrypted Backups',
      description: 'Automated encrypted backups stored in geographically distributed locations. Disaster recovery tested quarterly.'
    },
    {
      icon: FileCheck,
      title: 'Tamper-Evident Audit Logs',
      description: 'Cryptographic chain verification ensures audit logs cannot be modified. Complete transparency for compliance.'
    },
    {
      icon: Globe,
      title: 'GDPR & Data Residency',
      description: 'Full GDPR compliance with EU data residency options. Right to deletion, data portability, and access controls.'
    }
  ];

  const certifications = [
    { name: 'ISO 27001', description: 'Information Security Management', status: 'In Progress' },
    { name: 'SOC 2 Type II', description: 'Security, Availability, Confidentiality', status: 'In Progress' },
    { name: 'GDPR', description: 'General Data Protection Regulation', status: 'Compliant' },
    { name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act', status: 'Compliant' }
  ];

  const dataProtection = [
    {
      category: 'Data Collection',
      practices: [
        'Minimal data collection - only what\'s necessary for reporting',
        'Anonymous submissions supported by default',
        'Optional contact information stored separately from report content',
        'No tracking cookies or analytics on public reporting forms'
      ]
    },
    {
      category: 'Data Storage',
      practices: [
        'All data encrypted at rest using AES-256-GCM',
        'Encryption keys managed in secure hardware security modules (HSMs)',
        'Database backups encrypted and geographically distributed',
        'EU data residency available for GDPR compliance'
      ]
    },
    {
      category: 'Data Access',
      practices: [
        'Role-based access controls limit who can view reports',
        'Multi-factor authentication required for all admin accounts',
        'All access logged with tamper-evident audit trails',
        'Automatic session timeout after 30 minutes of inactivity'
      ]
    },
    {
      category: 'Data Retention',
      practices: [
        'Customizable retention policies per organization',
        'Automatic deletion after retention period expires',
        'Secure deletion using cryptographic erasure',
        'Right to deletion honored within 30 days for GDPR'
      ]
    }
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/security"
        fallbackTitle="Security & Trust Center | Disclosurely"
        fallbackDescription="AES-256 encryption, zero-knowledge architecture, and GDPR compliance. Learn how we protect whistleblower anonymity with bank-grade security."
      />

      <StandardHeader currentLanguage={currentLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Security & Trust Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Your security is our priority. Learn how we protect whistleblower anonymity with military-grade encryption, zero-knowledge architecture, and industry-leading security practices.
            </p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">
        {/* Security Highlights */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AES-256-GCM Encryption</h3>
                <p className="text-gray-600">
                  Military-grade encryption protects all data at rest and in transit. Same standard used by banks and governments.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Zero-Knowledge Architecture</h3>
                <p className="text-gray-600">
                  We cannot decrypt your reports. Only authorized users in your organization can access submitted reports.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">GDPR Compliant</h3>
                <p className="text-gray-600">
                  Full compliance with GDPR, HIPAA, SOX, and other major privacy and security regulations.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Comprehensive Security Features
              </h2>
              <p className="text-lg text-gray-600">
                Enterprise-grade security designed to protect whistleblower anonymity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityFeatures.map((feature, index) => {
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

        {/* Certifications & Compliance */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Certifications & Compliance
              </h2>
              <p className="text-lg text-gray-600">
                Meeting industry-leading security and compliance standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {cert.status === 'Compliant' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    cert.status === 'Compliant' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {cert.status}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Protection Practices */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Data Protection Practices
              </h2>
              <p className="text-lg text-gray-600">
                How we collect, store, and protect your sensitive data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dataProtection.map((section, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    {section.category}
                  </h3>
                  <ul className="space-y-3">
                    {section.practices.map((practice, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{practice}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Enterprise-Grade Infrastructure
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Built on world-class cloud infrastructure with 99.99% uptime SLA. Your data is secure, available, and protected against disasters.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Cloud className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Global CDN</div>
                      <div className="text-gray-600">Fast, secure access from anywhere in the world</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Encrypted Backups</div>
                      <div className="text-gray-600">Automated backups stored in multiple geographic regions</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">DDoS Protection</div>
                      <div className="text-gray-600">Advanced protection against distributed denial of service attacks</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Regular Audits</div>
                      <div className="text-gray-600">Quarterly penetration testing and security audits</div>
                    </div>
                  </li>
                </ul>
              </div>
              <Card className="p-8 bg-white border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Security Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Uptime</span>
                      <span className="text-blue-600 font-bold">99.99%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: '99.99%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Encryption Strength</span>
                      <span className="text-green-600 font-bold">256-bit</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-600 h-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Response Time</span>
                      <span className="text-blue-600 font-bold">&lt;200ms</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">Security Score</span>
                      <span className="text-green-600 font-bold">A+</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-600 h-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Responsible Disclosure */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-2 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Responsible Disclosure Program</h3>
                  <p className="text-gray-600 mb-4">
                    We welcome security researchers to help us maintain the highest security standards. If you discover a security vulnerability, please email us at <a href="mailto:security@disclosurely.com" className="text-blue-600 hover:underline">security@disclosurely.com</a>.
                  </p>
                  <p className="text-gray-600">
                    We commit to acknowledging all security reports within 24 hours and providing regular updates on remediation progress.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Security You Can Trust
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Protect your whistleblowers with military-grade encryption and zero-knowledge architecture. Start your free trial today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to={`${langPrefix}/auth/signup`}
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Start Free Trial
              </Link>
              <Link
                to={`${langPrefix}/contact`}
                className="inline-flex items-center px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold border border-blue-500"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Security;
