import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useManagerAuth } from '@/hooks/useManagerAuth';
import { Loader2 } from 'lucide-react';

interface ManagerProtectedRouteProps {
  children: ReactNode;
}

const ManagerProtectedRoute = ({ children }: ManagerProtectedRouteProps) => {
  const { isManager, loading } = useManagerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Verifying manager access...</p>
        </div>
      </div>
    );
  }

  if (!isManager) {
    return <Navigate to="/manager/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ManagerProtectedRoute;
