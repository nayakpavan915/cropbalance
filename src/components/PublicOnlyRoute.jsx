import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Login and Register pages: logged-in users get sent to the dashboard.
// We wait for the profile too, so a failed registration can still show its error.
export default function PublicOnlyRoute() {
  const { user, profile } = useAuth();

  if (user && profile) return <Navigate to="/" replace />;

  return <Outlet />;
}