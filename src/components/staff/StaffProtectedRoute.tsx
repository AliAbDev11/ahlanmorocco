import { Navigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Loader2 } from "lucide-react";

interface StaffProtectedRouteProps {
  children: React.ReactNode;
}

const StaffProtectedRoute = ({ children }: StaffProtectedRouteProps) => {
  const { user, isStaff, loading } = useStaffAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isStaff) {
    return <Navigate to="/staff/login" replace />;
  }

  return <>{children}</>;
};

export default StaffProtectedRoute;
