import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  chantiersApi, personnelApi, materiauxApi, equipementsApi,
  financesApi, documentsApi, avenantsApi,
} from '../api/endpoints';
import {
  fcfa, dateCourte, messageErreur, humaniser, LIBELLES_CONTRAT,
} from '../utils/format';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import StatutBadge from '../components/StatutBadge';
import ProgressBar from '../components/ProgressBar';
import ResourceTab from '../components/chantier/ResourceTab';
import ValidationActions from '../components/chantier/ValidationActions';
import Communication from '../components/chantier/Communication';

const opt = (map) => Object.entries(map).map(([valeur, libelle]) => ({ valeur, libelle }));

const TYPE_OPERATION = {
  depense: 'Dépense', devis: 'Devis', facture: 'Facture',
  bon_livraison: 'Bon de livraison', avance_acompte: 'Avance / acompte',
};
const CATEGORIE_FINANCE = {
  main_oeuvre: "Main d'œuvre", materiaux: 'Matériaux',
  equipements: 'Équipements', divers: 'Divers',
};
const TYPE_DOCUMENT = {
  plan: 'Plan', contrat: 'Contrat', rapport: 'Rapport',
  pv: 'PV', fiche_securite: 'Fiche sécurité', autre: 'Autre',
};
const TYPE_MISE_DISPO = { propriete: 'Propriété', location: 'Location' };
const ETAT_EQUIP = { bon_etat: 'Bon état', en_maintenance: 'En maintenance', defectueux: 'Défectueux' };

const lien = (url, libelle = 'Voir') =>
  url ? <a href={url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{libelle}</a> : <span className="text-slate-400">—</span>;

const ONGLETS = [
  { cle: 'personnel', libelle: 'Personnel' },
  { cle: 'materiaux', libelle: 'Matériaux' },
  { cle: 'equipements', libelle: 'Équipements' },
  { cle: 'finances', libelle: 'Finances' },
  { cle: 'documents', libelle: 'Documents' },
  { cle: 'avenants', libelle: 'Avenants' },
  { cle: 'communication', libelle: 'Communication' },
];

export default function ChantierDetail({ mode = 'chef' }) {
  const { id } = useParams();
  const idChantier = Number(id);
  const estChef = mode === 'chef';
  const estAdmin = mode === 'admin';
  const lienBase = estAdmin ? '/admin/chantiers' : '/chef/chantiers';

  const [chantier, setChantier] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [onglet, setOnglet] = useState('personnel');

  useEffect(() => {
    setChargement(true);
    chantiersApi.detail(idChantier)
      .then(({ data }) => setChantier(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [idChantier]);

  if (chargement) return <Spinner />;
  if (!chantier) return <PageHeader titre="Chantier introuvable" />;

  // --- Configs des onglets ressource ---
  const configs = {
    personnel: {
      api: personnelApi, titreSingulier: 'Membre du personnel',
      colonnes: [
        { entete: 'Nom', rendu: (p) => <span className="font-medium text-slate-800">{p.nom_complet}</span> },
        { entete: 'Poste', rendu: (p) => p.poste },
        { entete: 'Contrat', rendu: (p) => LIBELLES_CONTRAT[p.type_contrat] || p.type_contrat },
        { entete: 'Taux/jour', rendu: (p) => fcfa(p.taux_journalier) },
        { entete: 'Entrée', rendu: (p) => dateCourte(p.date_entree) },
      ],
      champs: [
        { nom: 'nom', libelle: 'Nom', required: true },
        { nom: 'prenom', libelle: 'Prénom', required: true },
        { nom: 'poste', libelle: 'Poste', required: true },
        { nom: 'telephone', libelle: 'Téléphone' },
        { nom: 'type_contrat', libelle: 'Type de contrat', type: 'select', required: true, options: opt(LIBELLES_CONTRAT) },
        { nom: 'taux_journalier', libelle: 'Taux journalier (FCFA)', type: 'number', step: '500' },
        { nom: 'date_entree', libelle: "Date d'entrée", type: 'date', required: true },
        { nom: 'numero_cni', libelle: 'Numéro CNI' },
        { nom: 'observations', libelle: 'Observations', type: 'textarea', pleine: true },
      ],
    },
    materiaux: {
      api: materiauxApi, titreSingulier: 'Matériau',
      colonnes: [
        { entete: 'Désignation', rendu: (m) => <span className="font-medium text-slate-800">{m.designation}</span> },
        { entete: 'Commandé', rendu: (m) => `${m.quantite_commandee} ${m.unite}` },
        { entete: 'Stock', rendu: (m) => m.stock_restant },
        { entete: 'P.U.', rendu: (m) => fcfa(m.prix_unitaire) },
        { entete: 'Total', rendu: (m) => fcfa(m.cout_total) },
        { entete: 'Justif.', rendu: (m) => lien(m.justificatif_url) },
      ],
      champs: [
        { nom: 'designation', libelle: 'Désignation', required: true, pleine: true },
        { nom: 'quantite_commandee', libelle: 'Quantité commandée', type: 'number', step: '0.01', required: true },
        { nom: 'unite', libelle: 'Unité', required: true },
        { nom: 'quantite_recue', libelle: 'Quantité reçue', type: 'number', step: '0.01' },
        { nom: 'quantite_utilisee', libelle: 'Quantité utilisée', type: 'number', step: '0.01' },
        { nom: 'prix_unitaire', libelle: 'Prix unitaire (FCFA)', type: 'number', step: '100', required: true },
        { nom: 'fournisseur', libelle: 'Fournisseur' },
        { nom: 'date_livraison', libelle: 'Date de livraison', type: 'date' },
        { nom: 'justificatif', libelle: 'Justificatif', type: 'file' },
        { nom: 'observations', libelle: 'Observations', type: 'textarea', pleine: true },
      ],
    },
    equipements: {
      api: equipementsApi, titreSingulier: 'Équipement',
      colonnes: [
        { entete: 'Nom', rendu: (e) => <span className="font-medium text-slate-800">{e.nom}</span> },
        { entete: 'Mise à dispo.', rendu: (e) => TYPE_MISE_DISPO[e.type_mise_dispo] || e.type_mise_dispo },
        { entete: 'Coût/jour', rendu: (e) => fcfa(e.cout_journalier) },
        { entete: 'Total location', rendu: (e) => fcfa(e.cout_total_location) },
        { entete: 'État', rendu: (e) => humaniser(e.etat) },
      ],
      champs: [
        { nom: 'nom', libelle: 'Nom', required: true },
        { nom: 'reference', libelle: 'Référence' },
        { nom: 'type_mise_dispo', libelle: 'Mise à disposition', type: 'select', required: true, options: opt(TYPE_MISE_DISPO) },
        { nom: 'fournisseur', libelle: 'Fournisseur' },
        { nom: 'cout_journalier', libelle: 'Coût journalier (FCFA)', type: 'number', step: '500' },
        { nom: 'date_affectation', libelle: "Date d'affectation", type: 'date', required: true },
        { nom: 'date_retour_prevue', libelle: 'Date de retour prévue', type: 'date' },
        { nom: 'etat', libelle: 'État', type: 'select', required: true, options: opt(ETAT_EQUIP) },
        { nom: 'justificatif', libelle: 'Justificatif', type: 'file' },
      ],
    },
    finances: {
      api: financesApi, titreSingulier: 'Opération financière',
      colonnes: [
        { entete: 'Libellé', rendu: (f) => <span className="font-medium text-slate-800">{f.libelle}</span> },
        { entete: 'Type', rendu: (f) => TYPE_OPERATION[f.type_operation] || f.type_operation },
        { entete: 'Catégorie', rendu: (f) => CATEGORIE_FINANCE[f.categorie] || f.categorie },
        { entete: 'Montant', rendu: (f) => fcfa(f.montant) },
        { entete: 'Date', rendu: (f) => dateCourte(f.date_operation) },
        { entete: 'Statut', rendu: (f) => <StatutBadge statut={f.statut} /> },
        { entete: 'Justif.', rendu: (f) => lien(f.justificatif_url) },
      ],
      champs: [
        { nom: 'libelle', libelle: 'Libellé', required: true, pleine: true },
        { nom: 'type_operation', libelle: "Type d'opération", type: 'select', required: true, options: opt(TYPE_OPERATION) },
        { nom: 'categorie', libelle: 'Catégorie', type: 'select', required: true, options: opt(CATEGORIE_FINANCE) },
        { nom: 'montant', libelle: 'Montant (FCFA)', type: 'number', step: '100', required: true },
        { nom: 'date_operation', libelle: "Date de l'opération", type: 'date', required: true },
        { nom: 'justificatif', libelle: 'Justificatif', type: 'file', pleine: true },
      ],
    },
    documents: {
      api: documentsApi, titreSingulier: 'Document',
      colonnes: [
        { entete: 'Titre', rendu: (d) => <span className="font-medium text-slate-800">{d.titre}</span> },
        { entete: 'Type', rendu: (d) => TYPE_DOCUMENT[d.type_document] || d.type_document },
        { entete: 'Statut', rendu: (d) => <StatutBadge statut={d.statut} /> },
        { entete: 'Fichier', rendu: (d) => lien(d.fichier_url, 'Télécharger') },
      ],
      champs: [
        { nom: 'titre', libelle: 'Titre', required: true, pleine: true },
        { nom: 'type_document', libelle: 'Type de document', type: 'select', required: true, options: opt(TYPE_DOCUMENT) },
        { nom: 'fichier', libelle: 'Fichier', type: 'file', accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx', required: true, pleine: true },
      ],
    },
    avenants: {
      api: avenantsApi, titreSingulier: 'Avenant',
      colonnes: [
        { entete: 'Motif', rendu: (a) => <span className="font-medium text-slate-800">{a.motif}</span> },
        { entete: 'Montant demandé', rendu: (a) => fcfa(a.montant_demande) },
        { entete: 'Statut', rendu: (a) => <StatutBadge statut={a.statut} /> },
        { entete: 'Demandé le', rendu: (a) => dateCourte(a.date_demande) },
        { entete: 'Justif.', rendu: (a) => lien(a.justificatif_url) },
      ],
      champs: [
        { nom: 'montant_demande', libelle: 'Montant demandé (FCFA)', type: 'number', step: '1000', required: true },
        { nom: 'motif', libelle: 'Motif', type: 'textarea', required: true, pleine: true },
        { nom: 'justificatif', libelle: 'Justificatif', type: 'file', pleine: true },
      ],
    },
  };

  // Actions de validation admin (finances / documents / avenants en attente)
  const actionsValidation = (api, statutValide) =>
    estAdmin
      ? (item, recharger) => (
          <ValidationActions api={api} item={item} recharger={recharger} statutValide={statutValide} />
        )
      : null;

  const actionsAdminParOnglet = {
    finances: actionsValidation(financesApi, 'valide'),
    documents: actionsValidation(documentsApi, 'valide'),
    avenants: actionsValidation(avenantsApi, 'approuve'),
  };

  const pourcentage = chantier.pourcentage_consomme ?? 0;
  const enAlerte = pourcentage >= 80;

  return (
    <div>
      <Link to={lienBase} className="mb-2 inline-block text-sm text-slate-500 hover:text-brand-600">← Retour aux chantiers</Link>
      <PageHeader
        titre={chantier.nom}
        sousTitre={`${chantier.reference} · ${chantier.maitre_ouvrage || "Maître d'ouvrage non renseigné"}`}
        action={<StatutBadge statut={chantier.statut} />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat libelle="Budget consolidé" valeur={fcfa(chantier.budget_consolide ?? chantier.budget_initial)} />
        <Stat libelle="Dépenses engagées" valeur={fcfa(chantier.depenses_engagees)} />
        <Stat libelle="Solde disponible" valeur={fcfa(chantier.solde)} accent={chantier.solde < 0 ? 'text-red-600' : 'text-emerald-600'} />
        <Stat libelle="Avancement" valeur={`${chantier.taux_avancement ?? 0}%`} />
      </div>

      <div className="card mb-5 p-4">
        <ProgressBar valeur={pourcentage} libelle="Budget consommé" />
        {enAlerte && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            ⚠ Seuil d'alerte atteint : {pourcentage}% du budget consommé.
          </p>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {ONGLETS.map((o) => (
          <button
            key={o.cle}
            onClick={() => setOnglet(o.cle)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              onglet === o.cle
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {o.libelle}
          </button>
        ))}
      </div>

      {onglet === 'communication' ? (
        <Communication idChantier={idChantier} />
      ) : (
        <ResourceTab
          key={onglet}
          idChantier={idChantier}
          api={configs[onglet].api}
          colonnes={configs[onglet].colonnes}
          champs={configs[onglet].champs}
          titreSingulier={configs[onglet].titreSingulier}
          peutGerer={estChef}
          actionsAdmin={actionsAdminParOnglet[onglet] || null}
        />
      )}
    </div>
  );
}

function Stat({ libelle, valeur, accent = 'text-slate-800' }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-400">{libelle}</p>
      <p className={`mt-1 text-lg font-bold ${accent}`}>{valeur}</p>
    </div>
  );
}
