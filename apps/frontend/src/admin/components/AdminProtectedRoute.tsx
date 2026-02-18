import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminProtectedRoute() {
  const { auth } = useAuth();
  if (!auth || auth.role !== 'ADMIN') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
