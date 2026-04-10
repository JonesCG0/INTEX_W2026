import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CookieConsent } from "@/components/common/CookieConsent"
import { useThemeStore } from "@/store/useThemeStore"
import { allowsOptionalFeatures, getConsentState, type HavenConsentState } from "@/lib/cookie-consent"

const PageNotFound = lazy(() => import('./lib/PageNotFound'));
const Home = lazy(() => import('./pages/Home'));
const Impact = lazy(() => import('./pages/Impact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const DonorDashboard = lazy(() => import('./pages/DonorDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Residents = lazy(() => import('./pages/admin/Residents'));
const Recordings = lazy(() => import('./pages/admin/Recordings'));
const Visitations = lazy(() => import('./pages/admin/Visitations'));
const Conferences = lazy(() => import('./pages/admin/Conferences'));
const Donors = lazy(() => import('./pages/admin/Donors'));
const Outreach = lazy(() => import('./pages/admin/Outreach'));
const Users = lazy(() => import('./pages/admin/Users'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const MlPipelines = lazy(() => import('./pages/admin/MlPipelines'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const DonorLayout = lazy(() => import('./components/DonorLayout'));
const PublicLayout = lazy(() => import('./components/PublicLayout'));

const ProtectedRoute = ({ children, allowedRole }: { children: ReactNode, allowedRole?: string }) => {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  
  // Wait until auth is ready before deciding where the user can go.
  if (isLoadingAuth) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <LoadingScreen />;
  }

  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Public Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
      
      {/* Login Page */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Donor Protected Routes */}
      <Route path="/donor" element={
        <ProtectedRoute allowedRole="Donor">
          <DonorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DonorDashboard />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="Admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="residents" element={<Residents />} />
        <Route path="residents/:id/recordings" element={<Recordings />} />
        <Route path="conferences" element={<Conferences />} />
        <Route path="visitations" element={<Visitations />} />
        <Route path="residents/:id/visitations" element={<Visitations />} />
        <Route path="donors" element={<Donors />} />
        <Route path="outreach" element={<Outreach />} />
        <Route path="users" element={<Users />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ml-pipelines" element={<MlPipelines />} />
      </Route>
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const OptionalFeaturesBootstrap = ({ enabled }: { enabled: boolean }) => {
  useEffect(() => {
    // Store the optional feature state on the document for CSS and UI helpers.
    document.documentElement.dataset.optionalFeatures = enabled ? "enabled" : "disabled";
  }, [enabled]);

  return null;
}

const RouteFallback = () => <LoadingScreen />;

function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const [consentState, setConsentState] = useState<HavenConsentState | null>(null);

  useEffect(() => {
    // Load the saved theme as soon as the app starts.
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    // Read cookie consent once on startup so optional features match the user's choice.
    setConsentState(getConsentState());
  }, []);

  const optionalFeaturesEnabled = allowsOptionalFeatures(consentState);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <OptionalFeaturesBootstrap enabled={optionalFeaturesEnabled} />
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <AuthenticatedApp />
          </Suspense>
        </Router>
        <Toaster position="bottom-right" richColors closeButton />
        <CookieConsent onConsentChange={setConsentState} />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
