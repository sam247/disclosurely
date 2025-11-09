import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
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
import ReportDetails from './pages/ReportDetails';
import OrganizationSettings from './components/dashboard/OrganizationSettings';
import OrganizationOnboarding from './components/OrganizationOnboarding';
import TeamView from './components/dashboard/TeamView';
import BrandingView from './components/dashboard/BrandingView';
import SecureLinkView from './components/dashboard/SecureLinkView';
import IntegrationsView from './components/IntegrationsView';
import AnalyticsView from './components/AnalyticsView';
import AuditLogView from './components/AuditLogView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AcceptInvite from './pages/AcceptInvite';
import NotFound from './pages/NotFound';
import SubmissionFormWrapper from './components/forms/SubmissionFormWrapper';
import CleanSubmissionWrapper from './components/forms/CleanSubmissionWrapper';
import ReportSuccess from './components/ReportSuccess';
import TestAnonymousSubmission from './pages/TestAnonymousSubmission';
import ScrollToTop from './components/ScrollToTop';
// import FeaturebaseMessenger from './components/FeaturebaseMessenger'; // REMOVED
import ReportStatusLookup from './components/ReportStatusLookup';
import AdminDashboard from './pages/AdminDashboard';
import Blog from './pages/Blog';
import WhistleblowerMessagingPage from './pages/WhistleblowerMessaging';
import Careers from './pages/Careers';
import ResumeDraft from './pages/ResumeDraft';

// Code splitting for public routes
const Index = lazy(() => import('./pages/Index'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const VsSpeakUp = lazy(() => import('./pages/VsSpeakUp'));
const VsWhistleblowerSoftware = lazy(() => import('./pages/VsWhistleblowerSoftware'));
const ComplianceSoftware = lazy(() => import('./pages/ComplianceSoftware'));
const WhistleblowingDirective = lazy(() => import('./pages/WhistleblowingDirective'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

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
        {/* Public routes - English (default) - Code split */}
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Index /></Suspense>} />
        <Route path="/pricing" element={<Suspense fallback={<PageLoader />}><Pricing /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        <Route path="/features" element={<Suspense fallback={<PageLoader />}><Features /></Suspense>} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/vs-speakup" element={<Suspense fallback={<PageLoader />}><VsSpeakUp /></Suspense>} />
        <Route path="/vs-whistleblower-software" element={<Suspense fallback={<PageLoader />}><VsWhistleblowerSoftware /></Suspense>} />
        <Route path="/compliance-software" element={<Suspense fallback={<PageLoader />}><ComplianceSoftware /></Suspense>} />
        <Route path="/whistleblowing-directive" element={<Suspense fallback={<PageLoader />}><WhistleblowingDirective /></Suspense>} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/invite/:token" element={<AcceptInvite />} />

        {/* Organization Onboarding - Protected Route */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OrganizationOnboarding />
            </ProtectedRoute>
          }
        />
        
        {/* Blog routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Anonymous report routes - Clean URLs */}
        <Route path="/report" element={<CleanSubmissionWrapper />} />
        <Route path="/submit" element={<CleanSubmissionWrapper />} />
        <Route path="/whistleblow" element={<CleanSubmissionWrapper />} />
        
        {/* Resume draft page */}
        <Route path="/resume-draft" element={<ResumeDraft />} />

        {/* Legacy token-based routes (for testing/fallback) */}
        <Route path="/secure/tool/submit/:linkToken" element={<SubmissionFormWrapper />} />
        <Route path="/secure/tool/submit/:linkToken/status" element={<ReportStatusLookup />} />

        {/* Report status and messaging */}
        <Route path="/status" element={<ReportStatusLookup />} />
        <Route path="/status/:trackingId" element={<WhistleblowerMessagingPage />} />
        <Route path="/success" element={<ReportSuccess />} />
        <Route path="/secure/tool/success" element={<ReportSuccess />} />
        <Route path="/secure/tool/lookup" element={<ReportStatusLookup />} />
        <Route path="/secure/tool/messaging/:trackingId" element={<WhistleblowerMessagingPage />} />
        
        {/* Testing routes */}
        <Route path="/test/anonymous-submission" element={<TestAnonymousSubmission />} />

        {/* Multilingual public routes - MUST BE AFTER specific routes - Code split */}
        <Route path="/:lang" element={<Suspense fallback={<PageLoader />}><Index /></Suspense>} />
        <Route path="/:lang/pricing" element={<Suspense fallback={<PageLoader />}><Pricing /></Suspense>} />
        <Route path="/:lang/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
        <Route path="/:lang/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
        <Route path="/:lang/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
        <Route path="/:lang/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        <Route path="/:lang/features" element={<Suspense fallback={<PageLoader />}><Features /></Suspense>} />
        <Route path="/:lang/careers" element={<Careers />} />
        <Route path="/:lang/vs-speakup" element={<Suspense fallback={<PageLoader />}><VsSpeakUp /></Suspense>} />
        <Route path="/:lang/vs-whistleblower-software" element={<Suspense fallback={<PageLoader />}><VsWhistleblowerSoftware /></Suspense>} />
        <Route path="/:lang/compliance-software" element={<Suspense fallback={<PageLoader />}><ComplianceSoftware /></Suspense>} />
        <Route path="/:lang/auth/login" element={<Login />} />
        <Route path="/:lang/auth/signup" element={<Signup />} />
        
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
          path="/dashboard/reports/:reportId" 
          element={
            <ProtectedRoute>
              <ReportDetails />
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
                <OrganizationSettings />
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
        <Route 
          path="/dashboard/audit" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AuditLogView />
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
        {/* <FeaturebaseMessenger /> REMOVED */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;