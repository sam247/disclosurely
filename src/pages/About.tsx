import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, CheckCircle, Headphones } from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { StandardHero } from '@/components/StandardHero';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const About: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageFromUrl();

  return (
    <>
      <DynamicHelmet
        pageIdentifier="about"
        fallbackTitle={t('about.meta.title')}
        fallbackDescription={t('about.meta.description')}
      />
      
      <StandardHeader currentLanguage={currentLanguage} />
      
      <StandardHero
        title={t('about.hero.title')}
        subtitle={t('about.hero.subtitle')}
        highlightText={t('about.hero.description')}
      />
      
      <div className="min-h-screen bg-white">

        {/* Mission Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('about.mission.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('about.mission.content')}
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('about.values.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('about.values.items.security.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('about.values.items.security.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('about.values.items.transparency.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('about.values.items.transparency.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('about.values.items.compliance.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('about.values.items.compliance.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('about.values.items.support.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('about.values.items.support.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('about.team.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('about.team.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('about.story.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {t('about.story.content')}
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
