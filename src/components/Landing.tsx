import { Shield, CheckCircle, BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import anonymousReportingIcon from '@/assets/icons/anonymous_reporting.png';
import secureMessagingIcon from '@/assets/icons/secure_messaging.png';
import caseManagementIcon from '@/assets/icons/case_management.png';
import multiUserAccessIcon from '@/assets/icons/multi-user_access.png';
import regulatoryComplianceIcon from '@/assets/icons/regulatory_compliance.png';
import enterpriseSecurityIcon from '@/assets/icons/enterprise_security.png';
import anonymousReportingArtwork from '@/assets/artwork/anonymous_reporting_made_simple.png';
import militaryGradeEncryptionArtwork from '@/assets/artwork/military_grade_encryption.png';
import complianceMadeEasyArtwork from '@/assets/artwork/compliance_made_easy.png';
import secureTwoWayCommArtwork from '@/assets/artwork/secure_two_way_communication.png';
import aiPoweredCaseAnalysisArtwork from '@/assets/artwork/ai_powered_case_analysis.png';
import iso27001Badge from "/lovable-uploads/9762866a-d8d9-4860-bf30-3ffd178885a8.png";
import gdprBadge from "/lovable-uploads/70aa6ac0-c161-4167-921d-79f08f6f4b02.png";
import aicpaBadge from "/lovable-uploads/a9716d48-ff27-4193-b51c-9b035d1692b0.png";
import techFlowLogo from "@/assets/logos/techflow-logo-clean.png";
import greenPointLogo from "@/assets/logos/greenpoint-logo.png";
import innovateLogo from "@/assets/logos/innovate-logo.png";
import horizonLogo from "@/assets/logos/horizon-logo.png";
import metroSyncLogo from "@/assets/logos/metrosync-logo-clean.png";
import prismLogo from "@/assets/logos/prism-logo-clean.png";
const Landing = () => {
  // For now, return static content since public landing doesn't have auth context
  // The admin panel will manage authenticated organization content

  return <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" alt="Disclosurely" className="h-7 md:h-8 w-auto" />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <a href="https://app.disclosurely.com/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</a>
              <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </div>
            <div className="md:hidden">
              <a href="https://app.disclosurely.com/auth/login" className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[150px] pb-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Whistleblowing and Disclosure
            <span className="block text-blue-600">Reporting Platform</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
            Disclosurely helps compliance teams stay ahead by transforming ethics and compliance into a proactive advantage—building a culture of integrity, simplifying workflows, and reducing organisational risk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <a href="https://app.disclosurely.com/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full sm:w-auto text-center">
              Start Free Trial
            </a>
            <Link to="/pricing" className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold w-full sm:w-auto text-center">
              View Pricing
            </Link>
          </div>

          {/* Trusted by Section - moved to hero area */}
          <div className="mt-16 mb-8">
            <div className="text-center mb-12">
              <p className="text-lg font-medium text-gray-600">
                Trusted by hundreds of UK businesses
              </p>
            </div>
            
            {/* Logo Carousel */}
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll space-x-16 items-center">
                {/* First set of logos */}
                <div className="flex space-x-16 items-center min-w-fit">
                  <img src={techFlowLogo} alt="TechFlow" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={greenPointLogo} alt="GreenPoint" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={innovateLogo} alt="Innovate Industries" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={horizonLogo} alt="Horizon Group" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={metroSyncLogo} alt="MetroSync Technologies" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={prismLogo} alt="Prism Analytics" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Duplicate set for seamless loop */}
                <div className="flex space-x-16 items-center min-w-fit">
                  <img src={techFlowLogo} alt="TechFlow" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={greenPointLogo} alt="GreenPoint" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={innovateLogo} alt="Innovate Industries" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={horizonLogo} alt="Horizon Group" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={metroSyncLogo} alt="MetroSync Technologies" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  <img src={prismLogo} alt="Prism Analytics" className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for secure reporting
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our platform provides comprehensive tools to manage whistleblower reports with complete confidentiality and compliance.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={anonymousReportingIcon} alt="Anonymous Reporting" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Anonymous Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Complete anonymity for whistleblowers with encrypted submissions and secure identity protection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={secureMessagingIcon} alt="Secure Messaging" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Secure Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Two-way encrypted communication between whistleblowers and investigators while maintaining anonymity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={caseManagementIcon} alt="Case Management" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Case Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Comprehensive dashboard to track, investigate, and resolve cases with full audit trails.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={multiUserAccessIcon} alt="Multi-User Access" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Multi-User Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Role-based permissions for legal, HR, and compliance teams with controlled access levels.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={regulatoryComplianceIcon} alt="Regulatory Compliance" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Regulatory Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Built-in compliance with GDPR, SOX, and other regulatory requirements across industries.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16">
                  <img src={enterpriseSecurityIcon} alt="Enterprise Security" className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Bank-level encryption, secure hosting, and comprehensive data protection measures.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Get started with Disclosurely in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Set Up Your Portal
              </h3>
              <p className="text-gray-600">
                Create your account and customize your reporting portal in minutes. Add your branding, set up notification preferences, and configure your team access.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Share with Your Team
              </h3>
              <p className="text-gray-600">
                Distribute your secure reporting link to employees through email, intranet, or QR codes. Reports can be submitted 24/7 from any device, anywhere.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Manage & Resolve Cases
              </h3>
              <p className="text-gray-600">
                Receive instant notifications of new reports. Investigate, communicate securely with whistleblowers, and track cases through resolution with complete audit trails.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Anonymous Reporting Made Simple */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Anonymous Reporting Made Simple
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Enable employees to report misconduct, ethics violations, or other concerns completely anonymously. Our advanced encryption ensures whistleblower identity protection while maintaining full compliance with regulatory requirements.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Zero data collection on reporters</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Anonymous follow-up messaging</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Multiple language support</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={anonymousReportingArtwork} alt="Anonymous Reporting Made Simple" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Military-Grade Encryption */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={militaryGradeEncryptionArtwork} alt="Military-Grade Encryption" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Military-Grade Encryption
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Every report is protected with AES-256 encryption, the same standard used by banks and government agencies. Your sensitive data is secure from submission to resolution.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>AES-256 end-to-end encryption</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Encrypted file attachments</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>SOC 2 Type II compliant infrastructure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Made Easy */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Compliance Made Easy
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Built-in compliance with major regulations including GDPR, SOX, and industry-specific requirements. Automated documentation and audit trails keep you compliant without extra effort.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>GDPR & SOX compliant</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Automated audit trails</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Legal-ready documentation</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={complianceMadeEasyArtwork} alt="Compliance Made Easy" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Two-Way Communication */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={secureTwoWayCommArtwork} alt="Secure Two-Way Communication" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Secure Two-Way Communication
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Enable follow-up conversations between investigators and whistleblowers while maintaining complete anonymity. Request additional information and provide updates securely.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Anonymous messaging system</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>File sharing capabilities</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Real-time notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Case Analysis */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                AI-Powered Case Analysis
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our AI case helper automatically analyzes reports, identifies key information, and suggests next steps. Streamline your investigation process while ensuring nothing important is overlooked.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Intelligent case categorization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Risk assessment automation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Investigation recommendations</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="w-full h-64 flex items-center justify-center rounded-lg">
                <img src={aiPoweredCaseAnalysisArtwork} alt="AI-Powered Case Analysis" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Flexible pricing designed around your organisation. Choose the plan that fits your needs, tailor the features, and get started right away with guided setup support. All plans include a 7-day free trial.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">£9.99</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <CardDescription className="text-sm sm:text-base">Perfect for small organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">5 cases/month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">1GB Storage</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">Secure two-way Messaging</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">AI Case Helper</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">Custom branding</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-gray-500 text-sm sm:text-base">Email Support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <a href="https://app.disclosurely.com/auth/signup">Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">£19.99</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <CardDescription className="text-sm sm:text-base">For growing organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Unlimited cases/month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Unlimited storage</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Secure two-way Messaging</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">AI Case Helper</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom branding</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Email Support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" asChild>
                  <a href="https://app.disclosurely.com/auth/signup">Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">Custom</span>
                </div>
                <CardDescription className="text-sm sm:text-base">For large organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Everything in Professional</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom domain</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Dedicated support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">SLA guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 text-sm sm:text-base">Custom integrations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-grey-600" />
                    <span className="text-gray-500 text-sm sm:text-base">API (coming soon)</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  <a href="https://disclosurely.com/contact">Contact Sales</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Organizations Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              See what our customers say about their experience with Disclosurely
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
                </div>
                <p className="text-gray-600 mb-4">
                  "Disclosurely has transformed how we handle sensitive reports. The anonymous messaging feature is particularly valuable."
                </p>
                <div className="font-medium text-gray-900">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Chief Compliance Officer</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
                </div>
                <p className="text-gray-600 mb-4">
                  "The platform is intuitive and secure. Our employees feel confident reporting issues, and we can investigate them effectively."
                </p>
                <div className="font-medium text-gray-900">Michael Chen</div>
                <div className="text-sm text-gray-500">HR Director</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
                </div>
                <p className="text-gray-600 mb-4">
                  "Implementation was seamless and the support team was excellent. Highly recommend for any organization serious about compliance."
                </p>
                <div className="font-medium text-gray-900">Emily Rodriguez</div>
                <div className="text-sm text-gray-500">Legal Counsel</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              
              Certifications
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We're in the process of obtaining the following industry standard certifications to ensure the highest level of security and compliance for your organization.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <img src="/lovable-uploads/9762866a-d8d9-4860-bf30-3ffd178885a8.png" alt="ISO 27001 Certification" className="h-16 w-16 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">ISO 27001</h3>
                <p className="text-sm text-gray-600">Information Security Management</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <img src="/lovable-uploads/70aa6ac0-c161-4167-921d-79f08f6f4b02.png" alt="GDPR Compliant" className="h-16 w-16 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">GDPR</h3>
                <p className="text-sm text-gray-600">Data Protection Compliance</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <img src="/lovable-uploads/a9716d48-ff27-4193-b51c-9b035d1692b0.png" alt="AICPA SOC" className="h-16 w-16 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">AICPA SOC</h3>
                <p className="text-sm text-gray-600">Service Organization Controls</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about Disclosurely
            </p>
          </div>
          
          <Accordion type="single" collapsible defaultValue="item-1" className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                How does anonymous reporting work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Whistleblowers can submit reports through your custom portal without providing any personal information. Our system uses advanced encryption and doesn't collect IP addresses or identifying data. Reporters receive a unique access code to check their report status and communicate securely.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Is Disclosurely compliant with GDPR and other regulations?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Yes, Disclosurely is built with compliance in mind. We're GDPR compliant and meet requirements for SOX, EU Whistleblowing Directive, and other major regulatory frameworks. All data is encrypted and stored securely in compliance with international data protection standards.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Can we customize the reporting portal?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Absolutely. You can add your company branding, customize the reporting form fields, set up specific categories for reports, and even use your own domain (on Professional and Enterprise plans). The portal can be tailored to match your organization's needs and culture.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                How quickly can we get started?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Most organizations are up and running within 24 hours. After signing up, you can immediately customize your portal, invite team members, and start accepting reports. Our support team is available to help with setup and onboarding at no extra cost.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                What support is included?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                All plans include email support and access to our comprehensive knowledge base. Professional plans include priority support with faster response times, while Enterprise customers receive dedicated support with SLA guarantees and optional on-site training.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Can we cancel or change our plan anytime?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Yes, you can upgrade, downgrade, or cancel your subscription at any time. If you cancel, you'll retain access until the end of your billing period. We also offer a 14-day free trial so you can test all features before committing.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Strengthen Your Compliance Program?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Not ready for a free trial or demo? Share your requirements with us, and we’ll respond quickly to discuss how Disclosurely can support your organisation.
          </p>
          <a href="https://app.disclosurely.com/auth/signup" className="bg-white hover:bg-gray-100 text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-lg font-semibold inline-block">
            Start Free Trial
          </a>
        </div>
      </div>

      <CookieConsentBanner />
      <Footer />
    </div>;
};
export default Landing;