
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/components/Dashboard';
import DynamicSubmissionForm from '@/components/DynamicSubmissionForm';
import ReportSuccess from '@/components/ReportSuccess';
import ReportStatus from '@/components/ReportStatus';
import SecureReportTool from '@/components/SecureReportTool';
import AdminPanel from '@/components/AdminPanel';
import ProtectedRoute from '@/components/ProtectedRoute';
import CompanyStatusPage from '@/components/CompanyStatusPage';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              
              {/* Public submission routes */}
              <Route path="/secure/tool" element={<SecureReportTool />} />
              <Route path="/secure/tool/submit/:linkToken" element={<DynamicSubmissionForm />} />
              <Route path="/secure/tool/submit/:linkToken/status" element={<CompanyStatusPage />} />
              <Route path="/secure/tool/success" element={<ReportSuccess />} />
              <Route path="/secure/tool/messages" element={<ReportStatus />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <CookieConsentBanner />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
