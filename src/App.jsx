import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Dashboard from "./pages/Dashboard";
import HarvestIntent from "./pages/HarvestIntent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Supply from "./pages/Supply";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/harvest" element={<HarvestIntent />} />
        <Route path="/supply" element={<Supply />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}