
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrganizationRoute from "@/components/OrganizationRoute";
import Landing from "./components/Landing";
import SecureReportTool from "./components/SecureReportTool";
import ReportStatus from "./components/ReportStatus";
import ReportSuccess from "./components/ReportSuccess";
import Dashboard from "./components/Dashboard";
import OrganizationOnboarding from "./components/OrganizationOnboarding";
import DynamicSubmissionForm from "./components/DynamicSubmissionForm";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/secure/tool" element={<SecureReportTool />} />
            <Route path="/secure/tool/report-status" element={<ReportStatus />} />
            <Route path="/secure/tool/success" element={<ReportSuccess />} />
            
            {/* Dynamic submission form routes */}
            <Route path="/submit/:orgDomain/:linkToken" element={<DynamicSubmissionForm />} />
            
            {/* Authentication routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
            {/* Organization onboarding */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <OrganizationOnboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected dashboard routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <OrganizationRoute>
                    <Dashboard />
                  </OrganizationRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
