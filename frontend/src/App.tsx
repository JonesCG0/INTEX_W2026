import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Impact from './pages/Impact';
import AdminDashboard from './pages/admin/Dashboard';
import Residents from './pages/admin/Residents';
import Recordings from './pages/admin/Recordings';
import Visitations from './pages/admin/Visitations';
import Donors from './pages/admin/Donors';
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';
import Privacy from './pages/Privacy';
import DonorDashboard from './pages/DonorDashboard';
import SignUp from './pages/SignUp';
import AdminLayout from './components/AdminLayout';
import DonorLayout from './components/DonorLayout';
import PublicLayout from './components/PublicLayout';
import Login from './pages/Login';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) => {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  
  if (isLoadingAuth) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Handle loading
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle errors
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
        <Route path="visitations" element={<Visitations />} />
        <Route path="residents/:id/visitations" element={<Visitations />} />
        <Route path="donors" element={<Donors />} />
        <Route path="users" element={<Users />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

import { CookieConsent } from "@/components/common/CookieConsent"
import { useThemeStore } from "@/store/useThemeStore"
import { useEffect } from "react"

function App() {
  const setTheme = useThemeStore((state) => state.setTheme);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Sync theme to document on first mount
    setTheme(theme);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <CookieConsent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
