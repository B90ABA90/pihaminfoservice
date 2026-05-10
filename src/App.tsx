import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/piham/ThemeProvider";
import { AmbientBackdrop } from "@/components/piham/AmbientBackdrop";
import { Preload } from "@/components/piham/Preload";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteContentProvider } from "@/hooks/useSiteContent";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";

// Lazy-load every non-home route to keep the initial bundle tiny.
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminQuotes = lazy(() => import("./pages/AdminQuotes.tsx"));
const VisualEditor = lazy(() => import("./pages/VisualEditor.tsx"));
const DynamicPage = lazy(() => import("./pages/DynamicPage.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Preload />
            <Toaster />
            <Sonner />
            <AmbientBackdrop />
            <SiteContentProvider>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/services/:slug" element={<ServiceDetail />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                  <Route path="/admin/editor" element={<ProtectedRoute requireAdmin><VisualEditor /></ProtectedRoute>} />
                  <Route path="/admin/quotes" element={<ProtectedRoute requireAdmin><AdminQuotes /></ProtectedRoute>} />
                  <Route path="/p/:slug" element={<DynamicPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </SiteContentProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
