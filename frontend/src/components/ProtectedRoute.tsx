import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api, { type CurrentUser } from '../api';

interface Props {
  requiredRole: string;
  children: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: Props) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .currentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user?.isAuthenticated || user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
