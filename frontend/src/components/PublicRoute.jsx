import { Navigate, Outlet } from "react-router-dom";
import { getToken,isTokenExpired,logout } from "../utils/auth";
export default function PublicRoute() {
  const token = getToken();

  if (token && isTokenExpired(token)) {
    logout();
  }

  return token ? <Navigate to="/accueil" replace /> : <Outlet />;
}