import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { dateCourte, messageErreur } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

const utilisateursApi = {
  liste: () => api.get('/utilisateurs'),
  creer: (data) => api.post('/utilisateurs', data),
  toggleActif: (id) => api.patch(`/utilisateurs/${id}/toggle-actif`),
  reinitialiserMotDePasse: (id, data) => api.patch(`/utilisateurs/${id}/reinitialiser-mot-de-passe`, data),

};

function BadgeRole({ role }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {role === 'admin' ? 'Administrateur' : 'Chef de chantier'}
    </span>
  );
}

function BadgeActif({ actif }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {actif ? 'Actif' : 'Désactivé'}
    </span>
  );
}

export default function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [soumission, setSoumission] = useState(false);
  const [modalMdp, setModalMdp] = useState(false);
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState(null);
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [soumissionMdp, setSoumissionMdp] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', role: 'chef_chantier' },
  });

  const charger = useCallback(() => {
    setChargement(true);
    utilisateursApi.liste()
      .then(({ data }) => setUtilisateurs(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
      
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const creer = async (valeurs) => {
    setSoumission(true);
    try {
      await utilisateursApi.creer(valeurs);
      toast.success('Utilisateur créé avec succès.');
      setModalOuverte(false);
      reset();
      charger();
    } catch (e) {
      toast.error(messageErreur(e));
    } finally {
      setSoumission(false);
    }
  };

  const toggleActif = async (utilisateur) => {
    const action = utilisateur.actif ? 'désactiver' : 'activer';
    if (!window.confirm(`Voulez-vous ${action} le compte de ${utilisateur.nom_complet} ?`)) return;
    try {
      await utilisateursApi.toggleActif(utilisateur.id);
      toast.success(`Compte ${utilisateur.actif ? 'désactivé' : 'activé'}.`);
      charger();
    } catch (e) {
      toast.error(messageErreur(e));
    }
  };

  const reinitialiserMdp = async () => {
    if (nouveauMdp.length < 8) {
      toast.error('8 caractères minimum.');
      return;
    }
    setSoumissionMdp(true);
    try {
      await utilisateursApi.reinitialiserMotDePasse(utilisateurSelectionne.id, {
        nouveau_mot_de_passe: nouveauMdp,
      });
      toast.success('Mot de passe réinitialisé.');
      setModalMdp(false);
      setNouveauMdp('');
      setUtilisateurSelectionne(null);
    } catch (e) {
      toast.error(messageErreur(e));
    } finally {
      setSoumissionMdp(false);
    }
  };

  return (
    <div>
      <PageHeader
        titre="Utilisateurs"
        sousTitre="Gérez les comptes admin et chefs de chantier"
        action={
          <button className="btn-primary" onClick={() => setModalOuverte(true)}>
            + Nouvel utilisateur
          </button>
        }
      />

      {chargement ? <Spinner /> : utilisateurs.length === 0 ? (
        <EmptyState titre="Aucun utilisateur" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Nom</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Téléphone</th>
                  <th className="table-th">Rôle</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th">Créé le</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {utilisateurs.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                          {(u.prenom?.[0] || '') + (u.nom?.[0] || '')}
                        </div>
                        <span className="font-medium text-slate-800">{u.nom_complet}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-600">{u.email}</td>
                    <td className="table-td text-slate-600">{u.telephone || '—'}</td>
                    <td className="table-td"><BadgeRole role={u.role} /></td>
                    <td className="table-td"><BadgeActif actif={u.actif} /></td>
                    <td className="table-td text-slate-500">{dateCourte(u.date_creation)}</td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => { setUtilisateurSelectionne(u); setModalMdp(true); }}
                          className="text-sm font-medium text-brand-600 hover:underline"
                        >
                          Réinit. MDP
                        </button>
                        <button
                          onClick={() => toggleActif(u)}
                          className={`text-sm font-medium hover:underline ${u.actif ? 'text-red-500' : 'text-green-600'}`}
                        >
                          {u.actif ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal création */}
      <Modal ouvert={modalOuverte} onFermer={() => { setModalOuverte(false); reset(); }} titre="Nouvel utilisateur">
        <form onSubmit={handleSubmit(creer)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom</label>
              <input className="input" {...register('prenom', { required: 'Requis' })} />
              {errors.prenom && <p className="mt-1 text-xs text-red-600">{errors.prenom.message}</p>}
            </div>
            <div>
              <label className="label">Nom</label>
              <input className="input" {...register('nom', { required: 'Requis' })} />
              {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email', { required: 'Requis' })} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" {...register('telephone')} />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" className="input" {...register('mot_de_passe', { required: 'Requis', minLength: { value: 8, message: '8 caractères minimum' } })} />
            {errors.mot_de_passe && <p className="mt-1 text-xs text-red-600">{errors.mot_de_passe.message}</p>}
          </div>
          <div>
            <label className="label">Rôle</label>
            <select className="input" {...register('role', { required: 'Requis' })}>
              <option value="chef_chantier">Chef de chantier</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => { setModalOuverte(false); reset(); }}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={soumission}>
              {soumission ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal réinitialisation mot de passe */}
      <Modal
        ouvert={modalMdp}
        onFermer={() => { setModalMdp(false); setNouveauMdp(''); setUtilisateurSelectionne(null); }}
        titre={`Réinitialiser le mot de passe — ${utilisateurSelectionne?.nom_complet}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Définissez un nouveau mot de passe pour cet utilisateur. Il pourra le modifier depuis son profil.
          </p>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input
              type="password"
              className="input"
              placeholder="8 caractères minimum"
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setModalMdp(false); setNouveauMdp(''); setUtilisateurSelectionne(null); }}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={reinitialiserMdp}
              disabled={soumissionMdp || nouveauMdp.length < 8}
            >
              {soumissionMdp ? 'Réinitialisation…' : 'Confirmer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}