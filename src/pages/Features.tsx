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
  Download,
  Upload
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
              Anonymous Reporting Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features Built for Secure, Anonymous Reporting
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From encrypted submissions to real-time dashboards, Disclosurely gives compliance teams the tools they need to manage reports efficiently, protect employee identities, and resolve issues before they escalate.
            </p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-white">

        {/* Value Proposition Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow rounded-2xl bg-white">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Anonymous by Default</h3>
                <p className="text-gray-600">
                  Every submission is encrypted end-to-end with zero-knowledge architecture. Employees can report concerns without revealing their identity, giving them confidence to speak up.
                </p>
              </Card>
              
              <Card className="p-8 text-center hover:shadow-lg transition-shadow rounded-2xl bg-white">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Insights</h3>
                <p className="text-gray-600">
                  Track case progress, monitor trends, and identify patterns with comprehensive dashboards. Make data-driven decisions with AI-powered risk assessment.
                </p>
              </Card>
              
              <Card className="p-8 text-center hover:shadow-lg transition-shadow rounded-2xl bg-white">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Compliance Ready</h3>
                <p className="text-gray-600">
                  Built for GDPR, SOX, ISO 27001, and more. Automated compliance reporting and audit trails ensure you're always ready for regulatory inspections.
                </p>
              </Card>
            </div>
          </div>
        </section>

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
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.anonymous.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.core.items.anonymous.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.ai.title') || 'AI Case Analysis'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.core.items.ai.description') || 'DeepSeek AI analyzes cases, identifies risk patterns, and provides actionable insights to help you resolve issues faster.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.dashboard.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.core.items.dashboard.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.compliance.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.core.items.compliance.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.mobile.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.core.items.mobile.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Plug className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {t('features.core.items.integration.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
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
                Comprehensive Dashboard
              </h2>
              <p className="text-lg text-gray-600">
                Centralized management with real-time insights and powerful analytics
              </p>
            </div>

            {/* Dashboard Preview - Matching Actual Design */}
            <Card className="p-8 rounded-lg shadow-2xl bg-white">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">9</div>
                      <div className="text-sm text-gray-600">Active Reports</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">9</div>
                      <div className="text-sm text-gray-600">Active Cases</div>
                      <div className="text-xs text-green-600 mt-1">↗ +2 this week</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-600">Archived Reports</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports Table Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Reports Overview</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Manage and review all submitted reports</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium">
                      Active Reports (9)
                    </div>
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-md text-xs sm:text-sm font-medium">
                      Archived (0)
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Assigned To</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">DIS-YU3Z4XJ9</td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 max-w-[200px] truncate">Financial Issues With Department Head</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            investigating
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Financial Misconduct
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden md:table-cell text-xs sm:text-sm text-gray-600">admin@...</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">23/10/2025</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium">View</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">DIS-5M0B79BF</td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 max-w-[200px] truncate">Discrimination in Promotion Decisions</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            investigating
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Discrimination
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden md:table-cell text-xs sm:text-sm text-gray-600">Unassigned</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">23/10/2025</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium">View</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                    <p className="text-gray-600 mb-3">
                      Get instant analysis on case patterns, risk assessment, and compliance trends with our DeepSeek AI integration.
                    </p>
                    <div className="flex gap-3">
                      <Badge className="bg-blue-100 text-blue-700">Risk Analysis</Badge>
                      <Badge className="bg-blue-100 text-blue-700">Category Trends</Badge>
                      <Badge className="bg-blue-100 text-blue-700">Response Time Insights</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Decision-Ready Analytics
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Get comprehensive insights with performance metrics, report trends, and AI-generated recommendations to make data-driven compliance decisions.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Performance Metrics</h3>
                      <p className="text-gray-600">Track resolution rates, response times, and escalation metrics in real-time</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Report Trends</h3>
                      <p className="text-gray-600">Identify patterns and spikes in submissions with visual trend analysis</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Activity className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Category Distribution</h3>
                      <p className="text-gray-600">Visual breakdown of report types to understand organizational risks</p>
                    </div>
                  </li>
                </ul>
              </div>
              <Card className="p-8 rounded-lg shadow-lg bg-white">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-gray-700" />
                        <span className="text-sm text-gray-600">Total Reports</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">9</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Active Cases</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">9</div>
                      <div className="text-xs text-green-600 mt-1">↗ Trending up</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Resolution Rate</span>
                            <span className="font-semibold">0%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-gray-400 h-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Escalation Rate</span>
                            <span className="font-semibold">11.1%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: '11%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-yellow-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">AI Insight</h4>
                        <p className="text-sm text-gray-700">Low Resolution Rate - Consider additional resources or training</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Audit Trail Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <Card className="p-8 rounded-lg shadow-lg bg-white order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
                      <p className="text-sm text-gray-600">Comprehensive system-wide audit log</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md">Refresh</button>
                      <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md">Export</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-500">2025-10-25 17:44:15</span>
                        <Badge className="bg-green-100 text-green-700">Low</Badge>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">Organization sent message</div>
                      <div className="text-xs text-gray-600">report.message_sent • sam@betterranking.co.uk</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-500">2025-10-24 09:35:22</span>
                        <Badge className="bg-orange-100 text-orange-700">Medium</Badge>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">Team member invited</div>
                      <div className="text-xs text-gray-600">user.invite • sam@betterranking.co.uk</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-500">2025-10-24 09:28:26</span>
                        <Badge className="bg-red-100 text-red-700">High</Badge>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">User role revoked</div>
                      <div className="text-xs text-gray-600">role_management • system</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Showing 1-25 of 114 records</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700">1</button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700">2</button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700">3</button>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Comprehensive Audit Trail
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Tamper-evident logging with chain verification ensures complete transparency and compliance. Track every action with full accountability.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Chain Verified</h3>
                      <p className="text-gray-600">Cryptographic verification of all audit records</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Severity Levels</h3>
                      <p className="text-gray-600">Color-coded severity indicators (Low, Medium, High) for quick assessment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Activity className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Event Categories</h3>
                      <p className="text-gray-600">Organized by case management, user management, and security</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* AI Case Helper Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  AI-Powered Case Analysis
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  DeepSeek AI analyzes cases, identifies risk patterns, and provides actionable insights. Upload company documents for comprehensive analysis with intelligent risk assessment.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Intelligent Risk Assessment</h3>
                      <p className="text-gray-600">AI evaluates case complexity and assigns risk levels automatically</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Document Analysis</h3>
                      <p className="text-gray-600">Upload company handbooks, policies, and documents for context-aware analysis</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Pattern Recognition</h3>
                      <p className="text-gray-600">Identify trends across multiple cases with advanced pattern matching</p>
                    </div>
                  </li>
                </ul>
              </div>
              <Card className="p-8 rounded-lg shadow-lg bg-white">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        AI Case Analysis
                      </h3>
                      <Badge className="bg-blue-600 text-white">∞ Credits</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select a new case and upload company documents for AI-powered analysis
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Select New Case</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white pointer-events-none" disabled>
                          <option>Choose a new case</option>
                          <option>DIS-YU3Z4XJ9 - Financial Issues</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Company Documents</label>
                        <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 pointer-events-none" disabled>
                          <Upload className="w-4 h-4" />
                          Upload Files
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Select a case and click "Analyze Case" to get started. You can ask specific questions or leave blank for general analysis.
                      </p>
                    </div>
                  </div>
                </div>
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

        {/* Sign-Off Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built for Compliance Teams Who Care About Details
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Disclosurely isn't just a platform—it's your partner in building a culture of integrity. Every feature is designed with your compliance team's workflow in mind, from encrypted submissions to comprehensive audit trails.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Military-Grade Security</h3>
                <p className="text-gray-600">
                  AES-GCM encryption ensures your data is protected at all times, with zero-knowledge architecture so even we can't access your submissions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  DeepSeek AI identifies risk patterns and provides actionable insights, helping you resolve issues faster and make data-driven compliance decisions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                <p className="text-gray-600">
                  Role-based access control and team assignments ensure the right people see the right information, while maintaining complete confidentiality.
                </p>
              </div>
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

        {/* Related Pages */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Next Steps</h2>
              <p className="text-gray-600">Ready to get started with Disclosurely?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <a href="https://app.disclosurely.com/auth/signup" className="block group">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Start Free Trial</h3>
                  <p className="text-gray-600 text-sm">
                    Try Disclosurely free for 7 days. Set up your secure reporting platform in minutes.
                  </p>
                </div>
              </a>

              <Link to={`${langPrefix}/pricing`} className="block group">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">View Pricing</h3>
                  <p className="text-gray-600 text-sm">
                    Explore our transparent pricing plans starting at £19.99/month with unlimited reports and military-grade security.
                  </p>
                </div>
              </Link>

              <Link to={`${langPrefix}/contact`} className="block group">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Contact Sales</h3>
                  <p className="text-gray-600 text-sm">
                    Have questions? Our team is here to help you find the right solution for your organization.
                  </p>
                </div>
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