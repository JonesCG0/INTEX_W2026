import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const SESSION_TOKEN_KEY = 'projectHaven.sessionToken';

const originalFetch = globalThis.fetch.bind(globalThis);
if (!(globalThis as typeof globalThis & { __projectHavenFetchPatched?: boolean }).__projectHavenFetchPatched) {
  (globalThis as typeof globalThis & { __projectHavenFetchPatched?: boolean }).__projectHavenFetchPatched = true;
  globalThis.fetch = async (input, init) => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      const headers = new Headers(init?.headers ?? undefined);
      if (!headers.has('X-ProjectHaven-Token')) {
        headers.set('X-ProjectHaven-Token', token);
      }
      return originalFetch(input, { ...init, headers });
    }

    return originalFetch(input, init);
  };
}

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

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setIsLoadingAuth(true);
      
      // Call ASP.NET AuthController to get current user info (via Cookie)
      const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      
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
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      localStorage.removeItem(SESSION_TOKEN_KEY);
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
