
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedApp from './AuthenticatedApp';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="https://app.disclosurely.com/auth/login" replace />;
  }

  // For dashboard route, always use AuthenticatedApp which handles setup flow
  return <AuthenticatedApp />;
};

export default ProtectedRoute;
