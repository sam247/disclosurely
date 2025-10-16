import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AuthenticatedApp from './components/AuthenticatedApp';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardView from './components/dashboard/DashboardView';
import AIHelperView from './components/dashboard/AIHelperView';
import SettingsView from './components/dashboard/SettingsView';
import TeamView from './components/dashboard/TeamView';
import BrandingView from './components/dashboard/BrandingView';
import SecureLinkView from './components/dashboard/SecureLinkView';
import IntegrationsView from './components/IntegrationsView';
import AnalyticsView from './components/AnalyticsView';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AcceptInvite from './pages/AcceptInvite';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import VsSpeakUp from './pages/VsSpeakUp';
import VsWhistleblowerSoftware from './pages/VsWhistleblowerSoftware';
import ComplianceSoftware from './pages/ComplianceSoftware';
import WhistleblowingDirective from './pages/WhistleblowingDirective';
import SubmissionFormWrapper from './components/forms/SubmissionFormWrapper';
import ReportSuccess from './components/ReportSuccess';
import TestAnonymousSubmission from './pages/TestAnonymousSubmission';
import ScrollToTop from './components/ScrollToTop';
import FeaturebaseMessenger from './components/FeaturebaseMessenger';
import ReportStatusLookup from './components/ReportStatusLookup';
import AdminDashboard from './pages/AdminDashboard';
import Blog from './pages/Blog';
import WhistleblowerMessagingPage from './pages/WhistleblowerMessaging';
import About from './pages/About';
import Features from './pages/Features';
import Careers from './pages/Careers';

// Component to handle session timeout only for authenticated users
const SessionTimeoutManager = () => {
  const { user } = useAuth();
  
  const { IdleWarningComponent, AbsoluteWarningComponent } = useSessionTimeout();

  // Only show session timeout for authenticated users
  if (!user) {
    return null;
  }
  return (
    <>
      {IdleWarningComponent}
      {AbsoluteWarningComponent}
    </>
  );
};

// Component inside AuthProvider but without session timeout for all routes
const AppContent = () => {
  return (
    <OrganizationProvider>
      <ScrollToTop />
      <Routes>
        {/* Public routes - English (default) */}
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/vs-speakup" element={<VsSpeakUp />} />
        <Route path="/vs-whistleblower-software" element={<VsWhistleblowerSoftware />} />
        <Route path="/compliance-software" element={<ComplianceSoftware />} />
        
        {/* Multilingual public routes */}
        <Route path="/:lang" element={<Index />} />
        <Route path="/:lang/pricing" element={<Pricing />} />
        <Route path="/:lang/contact" element={<Contact />} />
        <Route path="/:lang/terms" element={<Terms />} />
        <Route path="/:lang/privacy" element={<Privacy />} />
        <Route path="/:lang/about" element={<About />} />
        <Route path="/:lang/features" element={<Features />} />
        <Route path="/:lang/careers" element={<Careers />} />
        <Route path="/:lang/vs-speakup" element={<VsSpeakUp />} />
        <Route path="/:lang/vs-whistleblower-software" element={<VsWhistleblowerSoftware />} />
        <Route path="/:lang/compliance-software" element={<ComplianceSoftware />} />
        
        {/* Privacy route */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/whistleblowing-directive" element={<WhistleblowingDirective />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/:lang/auth/login" element={<Login />} />
        <Route path="/:lang/auth/signup" element={<Signup />} />
        <Route path="/invite/:token" element={<AcceptInvite />} />
        
        {/* Blog routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Anonymous report routes */}
        <Route path="/secure/tool/submit/:linkToken" element={<SubmissionFormWrapper />} />
        <Route path="/secure/tool/submit/:linkToken/status" element={<ReportStatusLookup />} />
        <Route path="/secure/tool/success" element={<ReportSuccess />} />
        <Route path="/secure/tool/lookup" element={<ReportStatusLookup />} />
        <Route path="/secure/tool/messaging/:trackingId" element={<WhistleblowerMessagingPage />} />
        
        {/* Testing routes */}
        <Route path="/test/anonymous-submission" element={<TestAnonymousSubmission />} />
        
        {/* Authenticated routes */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <AuthenticatedApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/ai-helper" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AIHelperView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/settings" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/team" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TeamView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/branding" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BrandingView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/secure-link" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SecureLinkView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/integrations" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <IntegrationsView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/analytics" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnalyticsView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Session timeout only for authenticated users */}
      <SessionTimeoutManager />
    </OrganizationProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <FeaturebaseMessenger />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;