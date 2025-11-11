import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Heart,
  Landmark,
  Factory,
  GraduationCap,
  Scale,
  ShoppingBag,
  HardHat,
  Laptop,
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Link } from 'react-router-dom';

const Industries: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;

  const industries = [
    {
      icon: Heart,
      title: 'Healthcare & Medical',
      description: 'HIPAA-compliant whistleblowing for hospitals, clinics, and healthcare organizations.',
      link: `${langPrefix}/industries/healthcare`,
      color: 'bg-red-100',
      iconColor: 'text-red-600',
      challenges: ['Patient safety concerns', 'HIPAA compliance', 'Medical malpractice']
    },
    {
      icon: Landmark,
      title: 'Finance & Banking',
      description: 'SOX-compliant reporting for financial institutions, banks, and investment firms.',
      link: `${langPrefix}/industries/finance`,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      challenges: ['Financial fraud', 'SOX compliance', 'Insider trading']
    },
    {
      icon: Factory,
      title: 'Manufacturing',
      description: 'Safety-first reporting for manufacturing plants, production facilities, and industrial operations.',
      link: `${langPrefix}/industries/manufacturing`,
      color: 'bg-gray-100',
      iconColor: 'text-gray-700',
      challenges: ['Safety violations', 'Quality control', 'Environmental compliance']
    },
    {
      icon: GraduationCap,
      title: 'Education',
      description: 'Protect students and staff with secure reporting for schools, universities, and educational institutions.',
      link: `${langPrefix}/industries/education`,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      challenges: ['Title IX compliance', 'Bullying & harassment', 'Academic integrity']
    },
    {
      icon: Scale,
      title: 'Legal & Law Firms',
      description: 'Attorney-client privilege protection with secure reporting for law firms and legal departments.',
      link: `${langPrefix}/industries/legal`,
      color: 'bg-amber-100',
      iconColor: 'text-amber-700',
      challenges: ['Conflicts of interest', 'Professional ethics', 'Client confidentiality']
    },
    {
      icon: ShoppingBag,
      title: 'Retail & E-commerce',
      description: 'Employee and customer protection for retail stores, e-commerce platforms, and consumer brands.',
      link: `${langPrefix}/industries/retail`,
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
      challenges: ['Employee theft', 'Customer complaints', 'Supply chain issues']
    },
    {
      icon: HardHat,
      title: 'Construction',
      description: 'OSHA-compliant safety reporting for construction companies, contractors, and building projects.',
      link: `${langPrefix}/industries/construction`,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      challenges: ['Safety violations', 'OSHA compliance', 'Contractor disputes']
    },
    {
      icon: Laptop,
      title: 'Technology & Startups',
      description: 'Fast-growing tech companies need agile compliance. Get started in 5 minutes.',
      link: `${langPrefix}/industries/technology`,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      challenges: ['IP theft', 'Harassment', 'Fast-paced growth']
    },
    {
      icon: Building2,
      title: 'Corporate & Enterprise',
      description: 'Multi-location enterprises with complex compliance needs and global operations.',
      link: `${langPrefix}/industries/corporate`,
      color: 'bg-gray-100',
      iconColor: 'text-gray-700',
      challenges: ['Global compliance', 'Multi-location management', 'Complex hierarchies']
    }
  ];

  return (
    <>
      <DynamicHelmet
        pageIdentifier="industries"
        fallbackTitle="Industries - Whistleblowing Solutions by Industry | Disclosurely"
        fallbackDescription="Industry-specific whistleblowing and compliance solutions. Healthcare, Finance, Manufacturing, Education, and more. HIPAA, SOX, GDPR compliant."
      />

      <StandardHeader currentLanguage={currentLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
              Industry Solutions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Whistleblowing Solutions Tailored to Your Industry
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every industry has unique compliance challenges. Disclosurely adapts to your sector's specific regulations, risks, and reporting needs.
            </p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">
        {/* Why Industry-Specific Matters */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Industry-Specific Compliance Matters
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Generic whistleblowing platforms miss the nuances. Your industry deserves better.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sector-Specific Compliance</h3>
                <p className="text-gray-600">
                  Pre-configured for your industry's regulations: HIPAA, SOX, OSHA, Title IX, GDPR, and more.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Industry Templates</h3>
                <p className="text-gray-600">
                  Pre-built report categories, policies, and workflows specific to your sector's most common issues.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Track Record</h3>
                <p className="text-gray-600">
                  Trusted by organizations in every major industry to handle sensitive compliance matters.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Choose Your Industry
              </h2>
              <p className="text-lg text-gray-600">
                Click any industry to learn how Disclosurely solves your specific compliance challenges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((industry, index) => {
                const IconComponent = industry.icon;
                return (
                  <Link key={index} to={industry.link} className="group">
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 h-full group-hover:border-blue-600 border-2 border-transparent">
                      <CardContent className="p-0">
                        <div className={`w-16 h-16 ${industry.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <IconComponent className={`w-8 h-8 ${industry.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {industry.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {industry.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-semibold text-gray-700">Common Challenges:</p>
                          {industry.challenges.map((challenge, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-600">{challenge}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Don't See Your Industry?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Disclosurely works for any industry. Contact us to discuss your specific compliance needs and regulatory requirements.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to={`${langPrefix}/contact`}
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Contact Sales
              </Link>
              <Link
                to={`${langPrefix}/auth/signup`}
                className="inline-flex items-center px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold border border-blue-500"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Industries;
