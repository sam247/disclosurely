
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { OrganizationProvider } from './contexts/OrganizationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthenticatedApp from './components/AuthenticatedApp';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import VsSpeakUp from './pages/VsSpeakUp';
import VsWhistleblowerSoftware from './pages/VsWhistleblowerSoftware';
import ComplianceSoftware from './pages/ComplianceSoftware';
import SubmissionFormWrapper from './components/forms/SubmissionFormWrapper';
import ReportSuccess from './components/ReportSuccess';
import TestAnonymousSubmission from './pages/TestAnonymousSubmission';
import ScrollToTop from './components/ScrollToTop';
import ReportStatusLookup from './components/ReportStatusLookup';
import AdminDashboard from './pages/AdminDashboard';
import Blog from './pages/Blog';
import WhistleblowerMessagingPage from './pages/WhistleblowerMessaging';

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrganizationProvider>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/vs-speakup" element={<VsSpeakUp />} />
            <Route path="/vs-whistleblower-software" element={<VsWhistleblowerSoftware />} />
            <Route path="/compliance-software" element={<ComplianceSoftware />} />
            
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
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
                  <AuthenticatedApp />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <AuthenticatedApp />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OrganizationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
