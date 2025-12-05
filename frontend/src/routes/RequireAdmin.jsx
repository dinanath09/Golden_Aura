// frontend/src/routes/RequireAdmin.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
