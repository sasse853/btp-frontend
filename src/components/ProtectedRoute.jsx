import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { estAuthentifie } = useAuth();
  return estAuthentifie ? <Outlet /> : <Navigate to="/login" replace />;
}
