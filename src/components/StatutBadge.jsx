import {
  LIBELLES_STATUT_CHANTIER,
  LIBELLES_STATUT_VALIDATION,
  LIBELLES_PRESENCE,
} from '../utils/format';

const COULEURS = {
  en_attente: 'bg-amber-100 text-amber-700',
  en_cours: 'bg-blue-100 text-blue-700',
  en_pause: 'bg-slate-100 text-slate-600',
  termine: 'bg-emerald-100 text-emerald-700',
  archive: 'bg-slate-100 text-slate-500',
  valide: 'bg-emerald-100 text-emerald-700',
  approuve: 'bg-emerald-100 text-emerald-700',
  rejete: 'bg-red-100 text-red-700',
  present: 'bg-emerald-100 text-emerald-700',
  demi_journee: 'bg-amber-100 text-amber-700',
  absent_justifie: 'bg-slate-100 text-slate-600',
  absent_non_justifie: 'bg-red-100 text-red-700',
  conge: 'bg-blue-100 text-blue-700',
};

export default function StatutBadge({ statut }) {
  const libelle =
    LIBELLES_STATUT_CHANTIER[statut] ||
    LIBELLES_STATUT_VALIDATION[statut] ||
    LIBELLES_PRESENCE[statut] ||
    statut;
  const couleur = COULEURS[statut] || 'bg-slate-100 text-slate-600';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${couleur}`}>
      {libelle}
    </span>
  );
}
