import { useState } from 'react';
import { toast } from 'react-toastify';
import { messageErreur } from '../../utils/format';
import Modal from '../Modal';

/**
 * Boutons Valider / Rejeter pour une ressource en attente (admin).
 * - api : module exposant valider(id, { statut, commentaire_admin })
 * - statutValide : valeur d'approbation ('valide' ou 'approuve')
 * - item, recharger : fournis par ResourceTab
 */
export default function ValidationActions({ api, item, recharger, statutValide = 'valide' }) {
  const [action, setAction] = useState(null); // null | 'valide' | 'rejete'
  const [commentaire, setCommentaire] = useState('');
  const [enCours, setEnCours] = useState(false);

  if (item.statut !== 'en_attente') return null;

  const confirmer = async () => {
    setEnCours(true);
    try {
      await api.valider(item.id, { statut: action, commentaire_admin: commentaire || null });
      toast.success(action === 'rejete' ? 'Demande rejetée.' : 'Demande validée.');
      setAction(null);
      setCommentaire('');
      recharger();
    } catch (e) {
      toast.error(messageErreur(e));
    } finally {
      setEnCours(false);
    }
  };

  const ouvrir = (type) => { setCommentaire(''); setAction(type); };

  return (
    <>
      <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700" onClick={() => ouvrir(statutValide)}>Valider</button>
      <button className="ml-3 text-sm font-medium text-red-500 hover:text-red-700" onClick={() => ouvrir('rejete')}>Rejeter</button>

      <Modal
        ouvert={Boolean(action)}
        onFermer={() => setAction(null)}
        titre={action === 'rejete' ? 'Rejeter la demande' : 'Valider la demande'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {action === 'rejete'
              ? 'Indiquez le motif du rejet (transmis au chef de chantier).'
              : 'Vous pouvez ajouter un commentaire optionnel.'}
          </p>
          <textarea
            rows={3}
            className="input"
            placeholder="Commentaire…"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setAction(null)}>Annuler</button>
            <button
              type="button"
              className={action === 'rejete' ? 'btn-danger' : 'btn-primary'}
              disabled={enCours}
              onClick={confirmer}
            >
              {enCours ? 'Traitement…' : action === 'rejete' ? 'Rejeter' : 'Valider'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
