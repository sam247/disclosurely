
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/components/Dashboard';
import OrganizationOnboarding from '@/components/OrganizationOnboarding';
import DynamicSubmissionForm from '@/components/DynamicSubmissionForm';
import SecureReportTool from '@/components/SecureReportTool';
import ReportStatus from '@/components/ReportStatus';
import ReportSuccess from '@/components/ReportSuccess';
import SecureMessaging from '@/components/SecureMessaging';
import ProtectedRoute from '@/components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
            {/* Secure routes for whistleblowers */}
            <Route path="/secure/messages" element={<SecureMessaging />} />
            <Route path="/secure/tool" element={<SecureReportTool />} />
            <Route path="/secure/tool/success" element={<ReportSuccess />} />
            <Route path="/secure/tool/:orgDomain/:linkToken" element={<DynamicSubmissionForm />} />
            <Route path="/secure/status/:trackingId" element={<ReportStatus />} />
            
            {/* Protected routes for authenticated users - simplified */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <OrganizationOnboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
