import Modal from './Modal';

export default function ConfirmModal({
  ouvert,
  onFermer,
  onConfirmer,
  titre = 'Confirmer',
  message = 'Cette action est-elle confirmée ?',
  libelleConfirmer = 'Confirmer',
  danger = false,
  enCours = false,
}) {
  return (
    <Modal ouvert={ouvert} onFermer={onFermer} titre={titre} taille="sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onFermer} disabled={enCours}>
          Annuler
        </button>
        <button
          type="button"
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirmer}
          disabled={enCours}
        >
          {enCours ? 'Traitement…' : libelleConfirmer}
        </button>
      </div>
    </Modal>
  );
}
