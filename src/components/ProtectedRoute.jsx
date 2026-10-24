import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Pages inside this wrapper are only visible to logged-in users.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="auth-page">
        <p role="status">Loading…</p>
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}