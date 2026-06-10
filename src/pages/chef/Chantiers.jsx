import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { chantiersApi } from '../../api/endpoints';
import { fcfa, dateCourte, messageErreur } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatutBadge from '../../components/StatutBadge';
import ProgressBar from '../../components/ProgressBar';

export default function ChefChantiers() {
  const [chantiers, setChantiers] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chantiersApi.liste({ page: 1 })
      .then(({ data }) => setChantiers(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <Spinner />;

  return (
    <div>
      <PageHeader titre="Mes chantiers" sousTitre="Les chantiers qui vous sont assignés" />

      {chantiers.length === 0 ? (
        <EmptyState titre="Aucun chantier assigné" description="L'administrateur ne vous a pas encore assigné de chantier." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chantiers.map((c) => (
            <Link key={c.id} to={`/chef/chantiers/${c.id}`} className="card p-5 transition hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{c.nom}</h3>
                  <p className="text-xs text-slate-400">{c.reference}</p>
                </div>
                <StatutBadge statut={c.statut} />
              </div>
              <p className="mb-3 text-sm text-slate-500">{c.maitre_ouvrage || 'Maître d\'ouvrage non renseigné'}</p>
              <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Budget</p>
                  <p className="font-semibold text-slate-700">{fcfa(c.budget_consolide ?? c.budget_initial)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Solde</p>
                  <p className="font-semibold text-slate-700">{fcfa(c.solde)}</p>
                </div>
              </div>
              <ProgressBar valeur={c.pourcentage_consomme} libelle="Budget consommé" />
              <p className="mt-3 text-xs text-slate-400">Fin prévue : {dateCourte(c.date_fin_prevue)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
