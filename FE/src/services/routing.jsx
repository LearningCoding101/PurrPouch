import { useAuth } from "../provider/auth_provider";
import { Navigate, Outlet } from "react-router-dom";

export const AuthGuard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const CustomerGuard = () => {
  const { isAuthenticated, isCustomer, isAdmin, isStaff } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow admin and staff to access customer pages
  if (!isCustomer && !isStaff && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export const AdminGuard = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export const StaffGuard = () => {
  const { isAuthenticated, isStaff } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export const GuestGuard = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
