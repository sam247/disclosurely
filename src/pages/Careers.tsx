import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  Home, 
  Heart,
  Users,
  Lightbulb,
  Handshake,
  Award,
  Mail
} from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { StandardHero } from '@/components/StandardHero';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

const Careers: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageFromUrl();

  return (
    <>
      <DynamicHelmet
        pageIdentifier="careers"
        fallbackTitle={t('careers.meta.title')}
        fallbackDescription={t('careers.meta.description')}
      />
      
      <StandardHeader currentLanguage={currentLanguage} />
      
      <StandardHero
        title={t('careers.hero.title')}
        subtitle={t('careers.hero.subtitle')}
        highlightText={t('careers.hero.description')}
        className="bg-gradient-to-br from-blue-50 to-indigo-100"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

        {/* Why Work With Us Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('careers.why.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('careers.why.items.mission.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('careers.why.items.mission.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('careers.why.items.growth.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('careers.why.items.growth.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('careers.why.items.flexibility.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('careers.why.items.flexibility.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('careers.why.items.benefits.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('careers.why.items.benefits.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('careers.openings.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('careers.openings.description')}
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('careers.openings.noOpenings')}
                  </h3>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    {t('careers.openings.apply')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Culture Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('careers.culture.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('careers.culture.description')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Innovation
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('careers.culture.values.innovation')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Handshake className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Collaboration
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('careers.culture.values.collaboration')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Integrity
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('careers.culture.values.integrity')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Diversity
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('careers.culture.values.diversity')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('careers.contact.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                {t('careers.contact.description')}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700">
                <Mail className="w-5 h-5" />
                <a href={`mailto:${t('careers.contact.email')}`} className="text-lg font-semibold">
                  {t('careers.contact.email')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Careers;
