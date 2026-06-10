import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dashboardApi } from '../../api/endpoints';
import { fcfa, messageErreur } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/PageHeader';
import KpiCard from '../../components/KpiCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatutBadge from '../../components/StatutBadge';
import ProgressBar from '../../components/ProgressBar';

export default function ChefDashboard() {
  const { utilisateur } = useAuth();
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then(({ data }) => setData(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <Spinner />;
  if (!data) return <EmptyState titre="Tableau de bord indisponible" />;

  const { kpis, mes_demandes, chantiers } = data;

  return (
    <div>
      <PageHeader titre={`Bonjour, ${utilisateur?.prenom} 👋`} sousTitre="Voici l'état de vos chantiers" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard libelle="Mes chantiers" valeur={kpis.nb_chantiers} sousTexte={`${kpis.nb_chantiers_actifs} en cours`} couleur="brand"
          icone="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3" />
        <KpiCard libelle="Budget géré" valeur={fcfa(kpis.budget_global)} couleur="blue"
          icone="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 8v2" />
        <KpiCard libelle="Dépenses engagées" valeur={fcfa(kpis.depenses_globales)} couleur="amber"
          icone="M9 7h6m0 10v-3m-3 3h.01M9 17h.01" />
        <KpiCard libelle="En attente de validation" couleur="red"
          valeur={mes_demandes.finances_en_attente + mes_demandes.documents_en_attente + mes_demandes.avenants_en_attente}
          sousTexte={`${mes_demandes.finances_en_attente} fin. · ${mes_demandes.documents_en_attente} doc. · ${mes_demandes.avenants_en_attente} av.`}
          icone="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold text-slate-700">Mes chantiers</h2>
      {(!chantiers || chantiers.length === 0) ? (
        <EmptyState titre="Aucun chantier assigné" />
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
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-slate-500">Solde disponible</span>
                <span className="font-semibold text-slate-700">{fcfa(c.solde)}</span>
              </div>
              <ProgressBar valeur={c.pourcentage_consomme} libelle="Budget consommé" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
