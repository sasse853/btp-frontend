import { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { messageErreur } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/PageHeader';

const profilApi = {
  changerMotDePasse: (data) => api.post('/mon-profil/changer-mot-de-passe', data),
};

export default function MonProfil() {
  const { utilisateur, role } = useAuth();
  const [soumission, setSoumission] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { mot_de_passe_actuel: '', nouveau_mot_de_passe: '', nouveau_mot_de_passe_confirmation: '' },
  });

  const nouveauMdp = watch('nouveau_mot_de_passe');

  const soumettre = async (valeurs) => {
    setSoumission(true);
    try {
      await profilApi.changerMotDePasse(valeurs);
      toast.success('Mot de passe modifié avec succès.');
      reset();
    } catch (e) {
      toast.error(messageErreur(e));
    } finally {
      setSoumission(false);
    }
  };

  return (
    <div>
      <PageHeader titre="Mon profil" sousTitre="Informations de votre compte" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Infos du compte */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Informations personnelles</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {(utilisateur?.prenom?.[0] || '') + (utilisateur?.nom?.[0] || '')}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">{utilisateur?.nom_complet}</p>
              <p className="text-sm text-slate-500">{role === 'admin' ? 'Administrateur' : 'Chef de chantier'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-700">{utilisateur?.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500">Prénom</span>
              <span className="text-sm font-medium text-slate-700">{utilisateur?.prenom}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500">Nom</span>
              <span className="text-sm font-medium text-slate-700">{utilisateur?.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Téléphone</span>
              <span className="text-sm font-medium text-slate-700">{utilisateur?.telephone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Changement de mot de passe */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Changer le mot de passe</h3>
          <form onSubmit={handleSubmit(soumettre)} className="space-y-4">
            <div>
              <label className="label">Mot de passe actuel</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('mot_de_passe_actuel', { required: 'Requis' })}
              />
              {errors.mot_de_passe_actuel && <p className="mt-1 text-xs text-red-600">{errors.mot_de_passe_actuel.message}</p>}
            </div>
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('nouveau_mot_de_passe', {
                  required: 'Requis',
                  minLength: { value: 8, message: '8 caractères minimum' },
                })}
              />
              {errors.nouveau_mot_de_passe && <p className="mt-1 text-xs text-red-600">{errors.nouveau_mot_de_passe.message}</p>}
            </div>
            <div>
              <label className="label">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('nouveau_mot_de_passe_confirmation', {
                  required: 'Requis',
                  validate: (v) => v === nouveauMdp || 'Les mots de passe ne correspondent pas.',
                })}
              />
              {errors.nouveau_mot_de_passe_confirmation && (
                <p className="mt-1 text-xs text-red-600">{errors.nouveau_mot_de_passe_confirmation.message}</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={soumission}>
              {soumission ? 'Modification…' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}