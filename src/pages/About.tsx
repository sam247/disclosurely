import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card } from '@/components/ui/card';
import { StandardHeader } from '@/components/StandardHeader';
import { StandardHero } from '@/components/StandardHero';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Shield, Eye, CheckCircle, Headphones, BarChart3, Users, Lock, Zap, TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;

  return (
    <>
      <DynamicHelmet
        pageIdentifier="about"
        fallbackTitle={t('about.meta.title')}
        fallbackDescription={t('about.meta.description')}
      />
      
      <StandardHeader currentLanguage={currentLanguage} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
              {t('about.hero.subtitle')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Who we are
            </h1>
          </div>
          
          {/* Mission Card Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" 
                alt="Our team working together"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <Card className="bg-gray-900 text-white p-8 rounded-2xl">
              <h3 className="text-3xl font-bold mb-4">We're on a mission!</h3>
              <p className="text-lg text-gray-200 leading-relaxed">
                {t('about.mission.content') || 'At Disclosurely, we're dedicated to empowering organizations with secure, compliant whistleblowing solutions. Our mission is to create a safer, more transparent work environment where employees can report concerns without fear, and organizations can maintain the highest standards of compliance and ethics.'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Success by Numbers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Our success by the numbers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center rounded-2xl">
              <div className="text-5xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Organizations Trust Us</div>
              <p className="text-gray-600">
                Leading companies worldwide rely on our secure reporting platform
              </p>
            </Card>
            
            <Card className="p-8 text-center rounded-2xl">
              <div className="text-5xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Uptime Guarantee</div>
              <p className="text-gray-600">
                Military-grade security ensuring your platform is always available
              </p>
            </Card>
            
            <Card className="p-8 text-center rounded-2xl">
              <div className="text-5xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Countries Served</div>
              <p className="text-gray-600">
                Supporting global compliance with multi-language capabilities
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Our company's values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Enterprise-Grade Security
              </h3>
              <p className="text-gray-600">
                Military-grade AES-GCM encryption ensures that every report is protected with the highest security standards. Your data is encrypted at rest and in transit, with zero-knowledge architecture.
              </p>
            </Card>
            
            <Card className="p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Enhanced Collaboration
              </h3>
              <p className="text-gray-600">
                Streamlined workflows connect your team seamlessly. Built-in case management, real-time notifications, and AI-powered insights help you resolve issues faster and more effectively.
              </p>
            </Card>
            
            <Card className="p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Instant Compliance
              </h3>
              <p className="text-gray-600">
                Automated compliance reporting built for GDPR, SOX, ISO 27001, and more. Stay audit-ready with comprehensive reporting tools and dashboard analytics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Feature Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-4">
                Dashboard Overview
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Intuitive Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our comprehensive dashboard provides real-time insights into your reporting activities. Track case resolution times, monitor trends, and manage your compliance requirements all from one central location.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Personalized Analytics</h4>
                    <p className="text-gray-600">
                      Track metrics that matter to your organization with customizable dashboards and automated reports.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Case Resolution Overview</h4>
                    <p className="text-gray-600">
                      Monitor case status, assignment, and resolution progress with our comprehensive case management system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-2xl transform rotate-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl text-white mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                    <div>
                      <div className="font-semibold">John Anderson</div>
                      <div className="text-sm text-blue-100">Security Manager</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">156</div>
                  <div className="text-blue-100">Active Reports</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-xl transform -rotate-2 w-64">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Recent Activity</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>New case #2476 assigned</div>
                  <div>Report resolved in 48h</div>
                  <div>2 pending reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Meet our team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The passionate people behind Disclosurely, dedicated to creating the most secure and compliant whistleblowing platform.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'CRO & Founder', avatar: '👩‍💼' },
              { name: 'Emily Kim', role: 'VP of Product', avatar: '👩‍🔬' },
              { name: 'David Lee', role: 'CEO & Co-Founder', avatar: '👨‍💼' },
              { name: 'Ethan Johnson', role: 'VP of Marketing', avatar: '👨‍🎨' },
              { name: 'Michael Brown', role: 'VP of Engineering', avatar: '👨‍💻' },
              { name: 'David Patel', role: 'Head of Design', avatar: '👨‍🎨' },
              { name: 'Noah Martinez', role: 'VP of Sales', avatar: '👨‍💼' },
              { name: 'Ethan Chen', role: 'Head of Customer Success', avatar: '👨‍🔧' },
            ].map((person, idx) => (
              <div key={idx} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  {person.avatar}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{person.name}</h3>
                <p className="text-sm text-gray-600">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What our users say
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. See what organizations using Disclosurely have to say about their experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                stars: 5, 
                title: 'Best-in-class security and compliance', 
                review: 'The level of security and compliance features exceeded our expectations. Disclosurely has been a game-changer for our organization.',
                author: 'Lisa Thompson',
                role: 'Compliance Officer'
              },
              { 
                stars: 5, 
                title: 'Incredible ease of use', 
                review: 'The intuitive dashboard and automated reporting make managing whistleblower reports effortless. Our team loves it!',
                author: 'James Wilson',
                role: 'HR Director'
              },
              { 
                stars: 5, 
                title: 'Outstanding customer support', 
                review: 'The support team is incredibly responsive and helpful. They helped us customize the platform perfectly for our needs.',
                author: 'Maria Garcia',
                role: 'Operations Manager'
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{testimonial.title}</h3>
                <p className="text-gray-600 mb-4">{testimonial.review}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to={`${langPrefix}/pricing`}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              View all reviews
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-yellow-600 text-black rounded-full text-sm font-medium mb-4">
                Get Started
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Build a culture of trust and compliance
              </h2>
              <p className="text-lg text-gray-800 mb-8">
                Join hundreds of organizations worldwide who trust Disclosurely for secure, compliant whistleblowing. Start your free trial today.
              </p>
              <div className="flex gap-4">
                <Link 
                  to={`${langPrefix}/auth/signup`}
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Start Free Trial
                </Link>
                <Link 
                  to={`${langPrefix}/features`}
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  View Features
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                  <div className="text-gray-800">Organizations</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
                  <div className="text-gray-800">Uptime</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
                  <div className="text-gray-800">Countries</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
                  <div className="text-gray-800">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;