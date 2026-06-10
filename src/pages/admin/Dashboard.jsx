import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../../api/endpoints';
import { fcfa, humaniser, messageErreur } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import KpiCard from '../../components/KpiCard';
import Spinner from '../../components/Spinner';
import ProgressBar from '../../components/ProgressBar';
import StatutBadge from '../../components/StatutBadge';
import EmptyState from '../../components/EmptyState';
import { toast } from 'react-toastify';

const COULEURS = ['#ea580c', '#2563eb', '#059669', '#9333ea', '#dc2626', '#0891b2'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then(({ data }) => setData(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <Spinner />;
  if (!data) return <EmptyState titre="Tableau de bord indisponible" description="Impossible de charger les données." />;

  const { kpis, validations_en_attente, alertes_budget, depenses_par_categorie, depenses_par_mois, chantiers } = data;

  const dataCategories = Object.entries(depenses_par_categorie || {}).map(([nom, total]) => ({
    nom: humaniser(nom), total,
  }));
  const dataMois = (depenses_par_mois || []).map((m) => ({ mois: m.mois, total: m.total }));

  return (
    <div>
      <PageHeader titre="Tableau de bord" sousTitre="Vue d'ensemble de l'activité des chantiers" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard libelle="Chantiers" valeur={kpis.nb_chantiers} sousTexte={`${kpis.nb_chantiers_actifs} en cours`} couleur="brand"
          icone="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3" />
        <KpiCard libelle="Budget global" valeur={fcfa(kpis.budget_global)} couleur="blue"
          icone="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 8v2" />
        <KpiCard libelle="Dépenses engagées" valeur={fcfa(kpis.depenses_globales)} couleur="amber"
          icone="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
        <KpiCard libelle="À valider" couleur="red"
          valeur={validations_en_attente.finances + validations_en_attente.documents + validations_en_attente.avenants}
          sousTexte={`${validations_en_attente.finances} fin. · ${validations_en_attente.documents} doc. · ${validations_en_attente.avenants} av.`}
          icone="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.5 0L3.18 16.25A2 2 0 005 19z" />
      </div>

      {alertes_budget?.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.5 0L3.18 16.25A2 2 0 005 19z" /></svg>
            Alertes budgétaires ({alertes_budget.length})
          </h3>
          <div className="space-y-2">
            {alertes_budget.map((a) => (
              <Link key={a.id} to={`/admin/chantiers/${a.id}`} className="block rounded-lg bg-white p-3 hover:ring-1 hover:ring-red-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{a.nom}</span>
                  <span className="font-semibold text-red-600">{a.pourcentage_consomme} %</span>
                </div>
                <ProgressBar valeur={a.pourcentage_consomme} />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Dépenses par catégorie</h3>
          {dataCategories.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Aucune dépense validée.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={dataCategories} dataKey="total" nameKey="nom" cx="50%" cy="50%" outerRadius={90} label={(e) => e.nom}>
                  {dataCategories.map((_, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fcfa(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Évolution des dépenses (6 mois)</h3>
          {dataMois.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Aucune donnée sur la période.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dataMois}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip formatter={(v) => fcfa(v)} />
                <Bar dataKey="total" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-700">Chantiers récents</h3>
        </div>
        {(!chantiers || chantiers.length === 0) ? (
          <div className="p-5"><EmptyState titre="Aucun chantier" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Chantier</th>
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
                    <td className="table-td"><StatutBadge statut={c.statut} /></td>
                    <td className="table-td">{fcfa(c.budget_consolide ?? c.budget_initial)}</td>
                    <td className="table-td w-48"><ProgressBar valeur={c.pourcentage_consomme} /></td>
                    <td className="table-td text-right">
                      <Link to={`/admin/chantiers/${c.id}`} className="text-sm font-semibold text-brand-600 hover:underline">Détails</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
