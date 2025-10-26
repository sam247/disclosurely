import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicHelmet from '@/components/DynamicHelmet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

        {/* Dashboard Showcase Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful Dashboard Analytics
              </h2>
              <p className="text-lg text-gray-600">
                Real-time insights and data-driven reporting at your fingertips
              </p>
            </div>

            {/* Dashboard Preview */}
            <Card className="p-8 rounded-2xl shadow-2xl bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
                  <div className="text-sm font-semibold text-gray-900">Active Reports</div>
                  <div className="text-xs text-gray-600 mt-1">+12% this month</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                  <div className="text-sm font-semibold text-gray-900">Avg. Resolution</div>
                  <div className="text-xs text-gray-600 mt-1">Within 48 hours</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24</div>
                  <div className="text-sm font-semibold text-gray-900">Pending Reviews</div>
                  <div className="text-xs text-gray-600 mt-1">Require attention</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600 mb-2">AI</div>
                  <div className="text-sm font-semibold text-gray-900">Risk Analysis</div>
                  <div className="text-xs text-gray-600 mt-1">Real-time insights</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <span className="text-sm text-gray-600">Last 7 days</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">JC</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">New case #2476 assigned</div>
                        <div className="text-sm text-gray-600">Compliance • 2 hours ago</div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Resolved</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold">SM</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Report resolved in 48h</div>
                        <div className="text-sm text-gray-600">Finance • 1 day ago</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">High Priority</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">LK</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">2 pending reviews</div>
                        <div className="text-sm text-gray-600">HR • 3 days ago</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-blue-100">Risk Level</span>
                        <span className="text-sm font-bold">Medium</span>
                      </div>
                      <div className="w-full bg-blue-500 h-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-400 h-full" style={{ width: '55%' }}></div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="text-sm text-blue-100 mb-3">Category Distribution</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Compliance</span>
                          <span className="font-bold">42%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>HR</span>
                          <span className="font-bold">28%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Finance</span>
                          <span className="font-bold">30%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
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