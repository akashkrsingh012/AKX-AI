import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userData } = useSelector((state: { user: { userData: unknown } }) => state.user);
  const location = useLocation();

  if (!userData) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
