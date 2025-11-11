import React, { useState } from 'react';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
  category: string;
}

const FAQ: React.FC = () => {
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'General',
      question: 'What is Disclosurely?',
      answer: 'Disclosurely is a secure, anonymous whistleblowing platform that allows employees to report workplace misconduct safely. We provide organizations with the tools to receive, investigate, and resolve reports while protecting whistleblower anonymity.'
    },
    {
      category: 'General',
      question: 'How does anonymous reporting work?',
      answer: 'Reports are encrypted on your device before transmission using military-grade AES-256-GCM encryption. Our zero-knowledge architecture means even we cannot decrypt reports. You receive a unique tracking ID to check status and communicate with investigators while remaining anonymous.'
    },
    {
      category: 'General',
      question: 'Who can see my report?',
      answer: 'Only authorized users in your organization with proper permissions can see reports. Access is controlled through role-based permissions, and all access is logged in tamper-evident audit trails.'
    },
    {
      category: 'Security & Privacy',
      question: 'Is my identity really protected?',
      answer: 'Yes. We use zero-knowledge architecture, which means we cannot decrypt your reports. No IP addresses, browser fingerprints, or identifying information is stored. You can optionally provide contact information, but it\'s stored separately from report content.'
    },
    {
      category: 'Security & Privacy',
      question: 'What encryption do you use?',
      answer: 'We use AES-256-GCM encryption for all data at rest and in transit. This is the same military-grade encryption used by governments and financial institutions. Encryption keys are managed in secure hardware security modules (HSMs).'
    },
    {
      category: 'Security & Privacy',
      question: 'Are you GDPR compliant?',
      answer: (
        <>
          Yes, Disclosurely is fully GDPR compliant. We offer EU data residency, support right to deletion, data portability, and implement privacy by design. Learn more on our <Link to={`${langPrefix}/security`} className="text-blue-600 hover:underline">Security page</Link>.
        </>
      )
    },
    {
      category: 'Security & Privacy',
      question: 'Can reports be traced back to me?',
      answer: 'No. We do not store IP addresses, browser fingerprints, or any identifying metadata. Our zero-knowledge architecture ensures complete anonymity. Even if someone gains unauthorized access to our systems, they cannot identify whistleblowers.'
    },
    {
      category: 'Pricing & Plans',
      question: 'How much does Disclosurely cost?',
      answer: (
        <>
          Our Pro plan starts at £39.99/month with unlimited reports, AI features, and full compliance tools. We also offer a Free plan for small organizations. See full pricing on our <Link to={`${langPrefix}/pricing`} className="text-blue-600 hover:underline">Pricing page</Link>.
        </>
      )
    },
    {
      category: 'Pricing & Plans',
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial with full access to all Pro features. No credit card required to start.'
    },
    {
      category: 'Pricing & Plans',
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.'
    },
    {
      category: 'Pricing & Plans',
      question: 'Do you offer discounts for nonprofits?',
      answer: 'Yes, we offer special pricing for registered nonprofits and educational institutions. Contact us at sales@disclosurely.com for more information.'
    },
    {
      category: 'Features',
      question: 'What is the AI Case Helper?',
      answer: 'Our AI Case Helper uses DeepSeek AI to analyze reports, assess risk levels, identify patterns across multiple cases, and provide actionable insights. It helps compliance teams resolve issues faster with data-driven recommendations.'
    },
    {
      category: 'Features',
      question: 'Can whistleblowers upload evidence?',
      answer: 'Yes, whistleblowers can securely upload photos, documents, screenshots, and other files to support their reports. All uploads are encrypted and stored securely.'
    },
    {
      category: 'Features',
      question: 'Do you support two-way messaging?',
      answer: 'Yes, investigators can ask follow-up questions and whistleblowers can provide updates—all while maintaining complete anonymity through the tracking ID system.'
    },
    {
      category: 'Features',
      question: 'Can I customize report categories?',
      answer: 'Yes, you can customize report categories, add custom fields, and configure automated routing rules based on your organization\'s specific needs.'
    },
    {
      category: 'Features',
      question: 'What languages do you support?',
      answer: 'Disclosurely supports multiple languages including English, Spanish, French, German, Portuguese, and more. Reports can be submitted in the whistleblower\'s preferred language.'
    },
    {
      category: 'Compliance',
      question: 'What regulations do you comply with?',
      answer: 'Disclosurely complies with GDPR, SOX, HIPAA, ISO 27001, EU Whistleblowing Directive, and other major regulations. We provide pre-configured templates and automated compliance reporting.'
    },
    {
      category: 'Compliance',
      question: 'Do you provide audit trails?',
      answer: 'Yes, all actions are logged in tamper-evident audit trails with cryptographic chain verification. This ensures complete transparency and meets regulatory audit requirements.'
    },
    {
      category: 'Compliance',
      question: 'Can I export compliance reports?',
      answer: 'Yes, you can export comprehensive compliance reports in PDF, CSV, and Excel formats for auditors and regulators.'
    },
    {
      category: 'Setup & Integration',
      question: 'How long does setup take?',
      answer: 'Setup takes approximately 5 minutes. Create an account, customize your reporting portal, and share the secure link with your organization. No technical expertise or IT support required.'
    },
    {
      category: 'Setup & Integration',
      question: 'Do I need to install software?',
      answer: 'No, Disclosurely is a cloud-based platform accessible through any web browser. There\'s no software to install or maintain.'
    },
    {
      category: 'Setup & Integration',
      question: 'Can I integrate with Slack or Microsoft Teams?',
      answer: 'Yes, we offer integrations with Slack, Microsoft Teams, and other tools. Enterprise plans include custom API access for advanced integrations.'
    },
    {
      category: 'Setup & Integration',
      question: 'Can I use my own domain?',
      answer: 'Yes, Enterprise plans support custom domains (e.g., reports.yourcompany.com). Pro plans receive a branded subdomain (e.g., yourcompany.disclosurely.com).'
    },
    {
      category: 'Support',
      question: 'What support do you offer?',
      answer: 'Pro plans include email support with 24-hour response time. Enterprise plans include priority support, dedicated account management, and phone support.'
    },
    {
      category: 'Support',
      question: 'Do you offer training?',
      answer: 'Yes, we provide comprehensive documentation, video tutorials, and live training sessions for Enterprise customers.'
    },
    {
      category: 'Support',
      question: 'What if I have a security concern?',
      answer: 'Please email security@disclosurely.com immediately. We take security seriously and will respond within 24 hours.'
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <>
      <DynamicHelmet
        pageIdentifier="/faq"
        fallbackTitle="Frequently Asked Questions (FAQ) | Disclosurely"
        fallbackDescription="Get answers to common questions about Disclosurely's anonymous whistleblowing platform, pricing, security, compliance, and features."
      />

      <StandardHeader currentLanguage={currentLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about Disclosurely's anonymous whistleblowing platform
            </p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">
        {/* FAQ Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
                <div className="space-y-4">
                  {faqs
                    .filter(faq => faq.category === category)
                    .map((faq, faqIndex) => {
                      const globalIndex = faqs.findIndex(f => f === faq);
                      const isOpen = openIndex === globalIndex;
                      return (
                        <Card key={faqIndex} className="overflow-hidden">
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-lg font-semibold text-gray-900 pr-4">
                              {faq.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <div className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Still Have Questions?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to={`${langPrefix}/contact`}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Contact Support
              </Link>
              <Link
                to={`${langPrefix}/auth/signup`}
                className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
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

export default FAQ;
