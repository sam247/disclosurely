import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Brain, 
  BarChart3, 
  CheckCircle, 
  Smartphone, 
  Plug,
  Lock,
  FileText,
  Users,
  HardDrive,
  Activity,
  FileSpreadsheet,
  TrendingUp,
  Download
} from 'lucide-react';
import { StandardHeader } from '@/components/StandardHeader';
import { Footer } from '@/components/ui/footer';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageFromUrl();
  const langPrefix = currentLanguage === 'en' ? '' : `/${currentLanguage}`;

  return (
    <>
      <DynamicHelmet
        pageIdentifier="features"
        fallbackTitle={t('features.meta.title')}
        fallbackDescription={t('features.meta.description')}
      />
      
      <StandardHeader currentLanguage={currentLanguage} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
              {t('features.hero.subtitle') || 'Comprehensive Features'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('features.hero.description') || 'Powerful features designed to help you manage compliance, protect whistleblowers, and build a culture of integrity.'}
            </p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">

        {/* Core Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('features.core.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.anonymous.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.core.items.anonymous.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.ai.title') || 'AI Case Analysis'}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.core.items.ai.description') || 'DeepSeek AI analyzes cases, identifies risk patterns, and provides actionable insights to help you resolve issues faster.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.dashboard.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.core.items.dashboard.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.compliance.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.core.items.compliance.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.mobile.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.core.items.mobile.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Plug className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.integration.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.core.items.integration.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('features.security.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.security.items.encryption.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.security.items.encryption.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.security.items.audit.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.security.items.audit.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.security.items.access.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.security.items.access.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <HardDrive className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.security.items.backup.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.security.items.backup.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('features.analytics.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.analytics.items.dashboard.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.analytics.items.dashboard.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.analytics.items.reports.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.analytics.items.reports.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.analytics.items.metrics.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.analytics.items.metrics.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Download className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('features.analytics.items.export.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('features.analytics.items.export.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial today and experience the power of our comprehensive whistleblowing platform.
            </p>
            <div className="flex gap-4 justify-center">
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
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Features;