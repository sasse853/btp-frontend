import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { financesApi, documentsApi, avenantsApi } from '../../api/endpoints';
import { fcfa, dateCourte, messageErreur } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ValidationActions from '../../components/chantier/ValidationActions';

const ONGLETS = [
  { cle: 'finances', libelle: 'Finances', api: financesApi, statutValide: 'valide' },
  { cle: 'documents', libelle: 'Documents', api: documentsApi, statutValide: 'valide' },
  { cle: 'avenants', libelle: 'Avenants', api: avenantsApi, statutValide: 'approuve' },
];

const lienChantier = (c) =>
  c ? <Link to={`/admin/chantiers/${c.id}`} className="text-brand-600 hover:underline">{c.nom}</Link> : '—';

const COLONNES = {
  finances: [
    { entete: 'Libellé', rendu: (f) => <span className="font-medium text-slate-800">{f.libelle}</span> },
    { entete: 'Chantier', rendu: (f) => lienChantier(f.chantier) },
    { entete: 'Montant', rendu: (f) => fcfa(f.montant) },
    { entete: 'Justificatif', rendu: (f) => f.justificatif_url
      ? <a href={f.justificatif_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Voir fichier</a>
      : <span className="text-slate-400 text-xs">Aucun</span>
    },
    { entete: 'Demandeur', rendu: (f) => f.utilisateur?.nom_complet || '—' },
    { entete: 'Date', rendu: (f) => dateCourte(f.date_operation) },
  ],
  documents: [
    { entete: 'Titre', rendu: (d) => <span className="font-medium text-slate-800">{d.titre}</span> },
    { entete: 'Chantier', rendu: (d) => lienChantier(d.chantier) },
    { entete: 'Fichier', rendu: (d) => d.fichier_url ? <a href={d.fichier_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Télécharger</a> : '—' },
    { entete: 'Déposé par', rendu: (d) => d.utilisateur?.nom_complet || '—' },
  ],
  avenants: [
    { entete: 'Motif', rendu: (a) => <span className="font-medium text-slate-800">{a.motif}</span> },
    { entete: 'Chantier', rendu: (a) => lienChantier(a.chantier) },
    { entete: 'Montant', rendu: (a) => fcfa(a.montant_demande) },
    { entete: 'Justificatif', rendu: (a) => a.justificatif_url
      ? <a href={a.justificatif_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Voir fichier</a>
      : <span className="text-slate-400 text-xs">Aucun</span>
    },
    { entete: 'Demandeur', rendu: (a) => a.demandeur?.nom_complet || '—' },
    { entete: 'Date', rendu: (a) => dateCourte(a.date_demande) },
  ],
};

export default function AdminValidations() {
  const [onglet, setOnglet] = useState('finances');
  const [items, setItems] = useState([]);
  const [chargement, setChargement] = useState(true);

  const config = ONGLETS.find((o) => o.cle === onglet);

  const charger = useCallback(() => {
    setChargement(true);
    config.api.liste({ statut: 'en_attente', page: 1 })
      .then(({ data }) => setItems(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [config]);

  useEffect(() => { charger(); }, [charger]);

  const colonnes = COLONNES[onglet];

  return (
    <div>
      <PageHeader titre="Validations" sousTitre="Demandes en attente de votre décision" />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {ONGLETS.map((o) => (
          <button
            key={o.cle}
            onClick={() => setOnglet(o.cle)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              onglet === o.cle ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {o.libelle}
          </button>
        ))}
      </div>

      {chargement ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState titre="Rien à valider" description="Aucune demande en attente dans cette catégorie." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {colonnes.map((c) => <th key={c.entete} className="table-th">{c.entete}</th>)}
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    {colonnes.map((c) => <td key={c.entete} className="table-td">{c.rendu(item)}</td>)}
                    <td className="table-td whitespace-nowrap text-right">
                      <ValidationActions api={config.api} item={item} recharger={charger} statutValide={config.statutValide} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
