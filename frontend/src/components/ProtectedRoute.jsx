import { Navigate, Outlet } from "react-router-dom";
import { getToken,isTokenExpired,logout } from "../utils/auth";

export default function ProtectedRoute() {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    logout();
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}