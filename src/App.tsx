import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import UrlRedirectMiddleware from './components/UrlRedirectMiddleware';

// Lazy load page components for better code splitting
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Careers = lazy(() => import('./pages/Careers'));
const VsSpeakUp = lazy(() => import('./pages/VsSpeakUp'));
const VsWhistleblowerSoftware = lazy(() => import('./pages/VsWhistleblowerSoftware'));
const ComplianceSoftware = lazy(() => import('./pages/ComplianceSoftware'));
const WhistleblowingDirective = lazy(() => import('./pages/WhistleblowingDirective'));
const Blog = lazy(() => import('./pages/Blog'));
const ResumeDraft = lazy(() => import('./pages/ResumeDraft'));
const TestAnonymousSubmission = lazy(() => import('./pages/TestAnonymousSubmission'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const WhistleblowerMessagingPage = lazy(() => import('./pages/WhistleblowerMessaging'));
const ReportDetails = lazy(() => import('./pages/ReportDetails'));

// Lazy load dashboard and authenticated components
const AuthenticatedApp = lazy(() => import('./components/AuthenticatedApp'));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const DashboardView = lazy(() => import('./components/dashboard/DashboardView'));
const AIHelperView = lazy(() => import('./components/dashboard/AIHelperView'));
const SettingsView = lazy(() => import('./components/dashboard/SettingsView'));
const OrganizationSettings = lazy(() => import('./components/dashboard/OrganizationSettings'));
const OrganizationOnboarding = lazy(() => import('./components/OrganizationOnboarding'));
const TeamView = lazy(() => import('./components/dashboard/TeamView'));
const BrandingView = lazy(() => import('./components/dashboard/BrandingView'));
const SecureLinkView = lazy(() => import('./components/dashboard/SecureLinkView'));
const IntegrationsView = lazy(() => import('./components/IntegrationsView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const AuditLogView = lazy(() => import('./components/AuditLogView'));
const WorkflowsView = lazy(() => import('./components/dashboard/WorkflowsView'));

// Lazy load form components
const SubmissionFormWrapper = lazy(() => import('./components/forms/SubmissionFormWrapper'));
const CleanSubmissionWrapper = lazy(() => import('./components/forms/CleanSubmissionWrapper'));
const ReportSuccess = lazy(() => import('./components/ReportSuccess'));
const ReportStatusLookup = lazy(() => import('./components/ReportStatusLookup'));

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
      <UrlRedirectMiddleware>
        <ScrollToTop />
        <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '16px',
          color: '#666'
        }}>
          Loading...
        </div>
      }>
        <Routes>
        {/* Public routes - English (default) */}
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/vs-speakup" element={<VsSpeakUp />} />
        <Route path="/vs-whistleblower-software" element={<VsWhistleblowerSoftware />} />
        <Route path="/compliance-software" element={<ComplianceSoftware />} />
        <Route path="/whistleblowing-directive" element={<WhistleblowingDirective />} />

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

        {/* Multilingual public routes - MUST BE AFTER specific routes */}
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
        <Route
          path="/dashboard/workflows"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkflowsView />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      {/* Session timeout only for authenticated users */}
      <SessionTimeoutManager />
      </UrlRedirectMiddleware>
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
