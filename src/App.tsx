
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import SecureReportTool from "./components/SecureReportTool";
import ReportStatus from "./components/ReportStatus";
import ReportSuccess from "./components/ReportSuccess";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/secure/tool" element={<SecureReportTool />} />
          <Route path="/secure/tool/report-status" element={<ReportStatus />} />
          <Route path="/secure/tool/success" element={<ReportSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/login" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
