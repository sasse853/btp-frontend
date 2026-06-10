import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Restreint l'acces a un role donne ; redirige vers le tableau de bord adapte sinon.
export default function RoleGuard({ role }) {
  const { role: roleCourant } = useAuth();

  if (roleCourant === role) {
    return <Outlet />;
  }

  const redirection = roleCourant === 'admin' ? '/admin' : '/chef';
  return <Navigate to={redirection} replace />;
}
