import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NotFound() {
  const { estAuthentifie, estAdmin } = useAuth();
  const accueil = !estAuthentifie ? '/login' : estAdmin ? '/admin' : '/chef';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-800">Page introuvable</h1>
      <p className="mt-1 text-sm text-slate-500">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to={accueil} className="btn-primary mt-6">Retour à l'accueil</Link>
    </div>
  );
}
