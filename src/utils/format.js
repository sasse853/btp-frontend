import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const fcfa = (montant) => {
  const valeur = Number(montant || 0);
  return `${valeur.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;
};

export const dateCourte = (valeur) => {
  if (!valeur) return '—';
  try {
    return format(typeof valeur === 'string' ? parseISO(valeur) : valeur, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return '—';
  }
};

export const dateHeure = (valeur) => {
  if (!valeur) return '—';
  try {
    return format(typeof valeur === 'string' ? parseISO(valeur) : valeur, 'dd/MM/yyyy à HH:mm', { locale: fr });
  } catch {
    return '—';
  }
};

export const LIBELLES_STATUT_CHANTIER = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  en_pause: 'En pause',
  termine: 'Terminé',
  archive: 'Archivé',
};

export const LIBELLES_STATUT_VALIDATION = {
  en_attente: 'En attente',
  valide: 'Validé',
  rejete: 'Rejeté',
  approuve: 'Approuvé',
};

export const LIBELLES_CONTRAT = {
  cdi: 'CDI',
  cdd: 'CDD',
  journalier: 'Journalier',
  prestataire: 'Prestataire',
};

export const LIBELLES_PRESENCE = {
  present: 'Présent',
  demi_journee: 'Demi-journée',
  absent_justifie: 'Absent justifié',
  absent_non_justifie: 'Absent non justifié',
  conge: 'Congé',
};

export const humaniser = (valeur) =>
  valeur ? valeur.charAt(0).toUpperCase() + valeur.slice(1).replace(/_/g, ' ') : '—';

export const messageErreur = (error) =>
  error?.response?.data?.message ||
  Object.values(error?.response?.data?.errors || {})?.[0]?.[0] ||
  'Une erreur est survenue.';
