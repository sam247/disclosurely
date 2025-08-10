
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
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
import AnonymousSubmissionTest from "./components/testing/AnonymousSubmissionTest";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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
              
              {/* Testing route */}
              <Route path="/test/anonymous-submission" element={<AnonymousSubmissionTest />} />
              
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
