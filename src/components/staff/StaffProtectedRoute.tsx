import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";

interface StaffProtectedRouteProps {
  children: React.ReactNode;
}

const StaffProtectedRoute = ({ children }: StaffProtectedRouteProps) => {
  const { user, loading, isStaff } = useStaffAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default StaffProtectedRoute;
