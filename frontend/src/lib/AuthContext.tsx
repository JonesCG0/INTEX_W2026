import React, { createContext, useState, useContext, useEffect } from 'react';
import { AUTH_ERROR_EVENT, apiFetch } from '@/lib/api-client';

const API_URL = import.meta.env.VITE_API_URL ?? '';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: any;
  appPublicSettings: any;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState<any>(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  useEffect(() => {
    const handleAuthFailure = (event: Event) => {
      const detail = (event as CustomEvent<{ status: number }>).detail;
      setUser(null);
      setIsAuthenticated(false);

      if (detail?.status === 401) {
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
        return;
      }

      if (detail?.status === 403 && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/donor'))) {
        window.location.href = '/';
      }
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthFailure as EventListener);
    return () => window.removeEventListener(AUTH_ERROR_EVENT, handleAuthFailure as EventListener);
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setIsLoadingAuth(true);
      
      const response = await apiFetch(`${API_URL}/api/auth/me`, { skipAuthHandling: true });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          setUser({
            email: data.email,
            full_name: data.displayName,
            role: data.role
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    } catch (error: any) {
      console.error('App state check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Failed to load session'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await apiFetch(`${API_URL}/api/auth/logout`, { method: 'POST', skipAuthHandling: true });
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
