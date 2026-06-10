import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { chantiersApi } from '../../api/endpoints';
import { fcfa, messageErreur } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatutBadge from '../../components/StatutBadge';
import ProgressBar from '../../components/ProgressBar';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';

const STATUTS = ['en_attente', 'en_cours', 'en_pause', 'termine', 'archive'];

function ChantierForm({ chantier, chefs, onAnnuler, onEnregistre }) {
  const enEdition = Boolean(chantier);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: chantier
      ? {
          nom: chantier.nom, adresse: chantier.adresse || '', budget_initial: chantier.budget_initial,
          maitre_ouvrage: chantier.maitre_ouvrage || '', statut: chantier.statut,
          date_debut_prevue: chantier.date_debut_prevue || '', date_fin_prevue: chantier.date_fin_prevue || '',
          id_chef_chantier: chantier.id_chef_chantier, description: chantier.description || '',
        }
      : { statut: 'en_attente', budget_initial: '' },
  });

  const soumettre = async (valeurs) => {
    try {
      if (enEdition) {
        await chantiersApi.modifier(chantier.id, valeurs);
        toast.success('Chantier mis à jour.');
      } else {
        await chantiersApi.creer(valeurs);
        toast.success('Chantier créé.');
      }
      onEnregistre();
    } catch (e) {
      toast.error(messageErreur(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(soumettre)} className="space-y-4">
      <div>
        <label className="label">Nom du chantier *</label>
        <input className="input" {...register('nom', { required: 'Nom requis.' })} />
        {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Budget initial (FCFA) *</label>
          <input type="number" step="1000" className="input" {...register('budget_initial', { required: 'Budget requis.', min: { value: 0, message: 'Doit être positif.' } })} />
          {errors.budget_initial && <p className="mt-1 text-xs text-red-600">{errors.budget_initial.message}</p>}
        </div>
        <div>
          <label className="label">Chef de chantier *</label>
          <select className="input" {...register('id_chef_chantier', { required: 'Chef requis.' })}>
            <option value="">— Sélectionner —</option>
            {chefs.map((c) => <option key={c.id} value={c.id}>{c.nom_complet}</option>)}
          </select>
          {errors.id_chef_chantier && <p className="mt-1 text-xs text-red-600">{errors.id_chef_chantier.message}</p>}
        </div>
      </div>
      <div>
        <label className="label">Maître d'ouvrage</label>
        <input className="input" {...register('maitre_ouvrage')} />
      </div>
      <div>
        <label className="label">Adresse</label>
        <input className="input" {...register('adresse')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Début prévu</label>
          <input type="date" className="input" {...register('date_debut_prevue')} />
        </div>
        <div>
          <label className="label">Fin prévue</label>
          <input type="date" className="input" {...register('date_fin_prevue')} />
        </div>
        <div>
          <label className="label">Statut *</label>
          <select className="input" {...register('statut', { required: true })}>
            {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea rows={3} className="input" {...register('description')} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onAnnuler}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : enEdition ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}

export default function AdminChantiers() {
  const [chantiers, setChantiers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [chefs, setChefs] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | chantier

  const charger = useCallback(() => {
    setChargement(true);
    chantiersApi.liste({ page })
      .then(({ data }) => { setChantiers(data.data); setMeta(data.meta); })
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [page]);

  useEffect(() => { charger(); }, [charger]);
  useEffect(() => {
    chantiersApi.chefs().then(({ data }) => setChefs(data.data)).catch(() => {});
  }, []);

  const fermerEtRafraichir = () => { setModal(null); charger(); };

  return (
    <div>
      <PageHeader
        titre="Chantiers"
        sousTitre="Gérez l'ensemble des chantiers de l'entreprise"
        action={<button className="btn-primary" onClick={() => setModal('create')}>+ Nouveau chantier</button>}
      />

      {chargement ? <Spinner /> : chantiers.length === 0 ? (
        <EmptyState titre="Aucun chantier" description="Commencez par créer votre premier chantier."
          action={<button className="btn-primary" onClick={() => setModal('create')}>+ Nouveau chantier</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Chantier</th>
                  <th className="table-th">Maître d'ouvrage</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th">Budget</th>
                  <th className="table-th">Consommé</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chantiers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <p className="font-medium text-slate-800">{c.nom}</p>
                      <p className="text-xs text-slate-400">{c.reference}</p>
                    </td>
                    <td className="table-td">{c.maitre_ouvrage || '—'}</td>
                    <td className="table-td"><StatutBadge statut={c.statut} /></td>
                    <td className="table-td whitespace-nowrap">{fcfa(c.budget_consolide ?? c.budget_initial)}</td>
                    <td className="table-td w-48"><ProgressBar valeur={c.pourcentage_consomme} /></td>
                    <td className="table-td whitespace-nowrap text-right">
                      <button className="mr-3 text-sm font-medium text-slate-500 hover:text-brand-600" onClick={() => setModal(c)}>Modifier</button>
                      <Link to={`/admin/chantiers/${c.id}`} className="text-sm font-semibold text-brand-600 hover:underline">Détails</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onChange={setPage} />
        </div>
      )}

      <Modal ouvert={Boolean(modal)} onFermer={() => setModal(null)} titre={modal === 'create' ? 'Nouveau chantier' : 'Modifier le chantier'} taille="lg">
        {modal && (
          <ChantierForm
            chantier={modal === 'create' ? null : modal}
            chefs={chefs}
            onAnnuler={() => setModal(null)}
            onEnregistre={fermerEtRafraichir}
          />
        )}
      </Modal>
    </div>
  );
}
