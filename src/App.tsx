
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import ComplianceSoftware from "./pages/ComplianceSoftware";
import VsSpeakUp from "./pages/VsSpeakUp";
import VsWhistleblowerSoftware from "./pages/VsWhistleblowerSoftware";
import WhistleblowerChat from "./pages/WhistleblowerChat";
import AuthenticatedApp from "./components/AuthenticatedApp";
import DynamicSubmissionForm from "./components/DynamicSubmissionForm";
import ReportStatus from "./components/ReportStatus";
import ReportSuccess from "./components/ReportSuccess";
import CompanyStatusPage from "./components/CompanyStatusPage";
import CookieConsentBanner from "./components/CookieConsentBanner";
import SubdomainRedirect from "./components/SubdomainRedirect";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Set security headers
    const setSecurityHeaders = () => {
      // Content Security Policy
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src 'self' https://js.stripe.com;";
      document.head.appendChild(meta);

      // X-Frame-Options
      const frameOptions = document.createElement('meta');
      frameOptions.httpEquiv = 'X-Frame-Options';
      frameOptions.content = 'DENY';
      document.head.appendChild(frameOptions);

      // X-Content-Type-Options
      const contentType = document.createElement('meta');
      contentType.httpEquiv = 'X-Content-Type-Options';
      contentType.content = 'nosniff';
      document.head.appendChild(contentType);
    };

    setSecurityHeaders();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SubdomainRedirect targetPath="/dashboard">
            <CookieConsentBanner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/compliance-software" element={<ComplianceSoftware />} />
              <Route path="/vs-speakup" element={<VsSpeakUp />} />
              <Route path="/vs-whistleblower-software" element={<VsWhistleblowerSoftware />} />
              
              {/* Whistleblower communication */}
              <Route path="/chat" element={<WhistleblowerChat />} />
              
              {/* Report submission routes */}
              <Route path="/secure/tool/submit/:linkToken" element={<DynamicSubmissionForm />} />
              <Route path="/secure/tool/submit/:linkToken/status" element={<ReportStatus />} />
              <Route path="/secure/tool/success" element={<ReportSuccess />} />
              
              {/* Company status page */}
              <Route path="/company/:domain/status" element={<CompanyStatusPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard/*" element={<AuthenticatedApp />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SubdomainRedirect>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
