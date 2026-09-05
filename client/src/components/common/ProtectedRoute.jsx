// Wraps any route that requires a logged-in user. While the initial
// silent-refresh check (see AuthContext) is running, we show nothing
// disruptive rather than redirecting prematurely.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return null; // Phase 12: replace with a proper loading skeleton
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
