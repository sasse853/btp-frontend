import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { connexion, selectEstAuthentifie, selectRole } from '../../store/authSlice';
import logoLogin from '../../assets/logo/logo-login-argente.png';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const estAuthentifie = useSelector(selectEstAuthentifie);
  const role = useSelector(selectRole);
  const statut = useSelector((s) => s.auth.statut);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', mot_de_passe: '' },
  });

  useEffect(() => {
    if (estAuthentifie) {
      navigate(role === 'admin' ? '/admin' : '/chef', { replace: true });
    }
  }, [estAuthentifie, role, navigate]);

  const soumettre = async (valeurs) => {
    const resultat = await dispatch(connexion(valeurs));
    if (connexion.fulfilled.match(resultat)) {
      const r = resultat.payload.utilisateur.role;
      toast.success(`Bienvenue ${resultat.payload.utilisateur.prenom} !`);
      navigate(r === 'admin' ? '/admin' : '/chef', { replace: true });
    } else {
      toast.error(resultat.payload || 'Connexion impossible.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src={logoLogin} alt="K.Mazar Groupe" className="mx-auto mb-3 h-28 w-28 rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-bold text-white">K.MAZAR GROUPE</h1>
          <p className="text-sm text-slate-300">Application de gestion de chantiers</p>
        </div>

        <div className="card p-6">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">Connexion</h2>
          <p className="mb-5 text-sm text-slate-500">Accédez à votre espace de travail.</p>

          <form onSubmit={handleSubmit(soumettre)} className="space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="admin@btp.com"
                {...register('email', {
                  required: "L'adresse e-mail est requise.",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Adresse e-mail invalide.' },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="mot_de_passe">Mot de passe</label>
              <input
                id="mot_de_passe"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('mot_de_passe', { required: 'Le mot de passe est requis.' })}
              />
              {errors.mot_de_passe && <p className="mt-1 text-xs text-red-600">{errors.mot_de_passe.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={statut === 'loading'}>
              {statut === 'loading' ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="mb-1 font-semibold text-slate-600">Comptes de démonstration</p>
            <p>Admin : admin@btp.com / password</p>
            <p>Chef de chantier : chef@btp.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
