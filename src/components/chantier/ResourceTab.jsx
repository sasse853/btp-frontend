import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { messageErreur } from '../../utils/format';
import Spinner from '../Spinner';
import EmptyState from '../EmptyState';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import FormChamps from '../forms/FormChamps';

/**
 * Onglet CRUD generique pour une ressource rattachee a un chantier.
 * - api : module { liste, creer, modifier, supprimer }
 * - colonnes : [{ entete, rendu(item) }]
 * - champs : config FormChamps
 * - peutGerer : autorise creation / edition / suppression (chef)
 * - actionsAdmin(item, recharger) : actions supplementaires (validation)
 */
export default function ResourceTab({
  idChantier, api, colonnes, champs, titreSingulier,
  peutGerer = false, actionsAdmin = null, valeursParDefaut = {},
}) {
  const [items, setItems] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | item
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);
  const fichiers = useRef({});

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const charger = useCallback(() => {
    setChargement(true);
    api.liste({ id_chantier: idChantier, page: 1 })
      .then(({ data }) => setItems(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [api, idChantier]);

  useEffect(() => { charger(); }, [charger]);

  const ouvrir = (item) => {
    fichiers.current = {};
    const defauts = item
      ? Object.fromEntries(champs.map((c) => [c.nom, item[c.nom] ?? '']))
      : { ...Object.fromEntries(champs.map((c) => [c.nom, ''])) };
    reset(defauts);
    setModal(item || 'create');
  };

  const setFichier = (nom, fichier) => { fichiers.current[nom] = fichier; };

  const soumettre = async (valeurs) => {
    const charge = { ...valeurs, ...fichiers.current, id_chantier: idChantier, ...valeursParDefaut };
    // Retire les chaines vides pour ne pas heurter les validations backend.
    Object.keys(charge).forEach((k) => { if (charge[k] === '' || charge[k] === null) delete charge[k]; });
    try {
      if (modal === 'create') {
        await api.creer(charge);
        toast.success(`${titreSingulier} ajouté.`);
      } else {
        await api.modifier(modal.id, charge);
        toast.success(`${titreSingulier} mis à jour.`);
      }
      setModal(null);
      charger();
    } catch (e) {
      toast.error(messageErreur(e));
    }
  };

  const supprimer = async () => {
    setSuppression(true);
    try {
      await api.supprimer(aSupprimer.id);
      toast.success(`${titreSingulier} supprimé.`);
      setASupprimer(null);
      charger();
    } catch (e) {
      toast.error(messageErreur(e));
    } finally {
      setSuppression(false);
    }
  };

  if (chargement) return <Spinner />;

  return (
    <div>
      {peutGerer && (
        <div className="mb-3 flex justify-end">
          <button className="btn-primary" onClick={() => ouvrir(null)}>+ Ajouter</button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState titre={`Aucun élément`} description={`Aucun ${titreSingulier.toLowerCase()} enregistré pour ce chantier.`} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {colonnes.map((col) => <th key={col.entete} className="table-th">{col.entete}</th>)}
                  {(peutGerer || actionsAdmin) && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    {colonnes.map((col) => <td key={col.entete} className="table-td">{col.rendu(item)}</td>)}
                    {(peutGerer || actionsAdmin) && (
                      <td className="table-td whitespace-nowrap text-right">
                        {actionsAdmin && actionsAdmin(item, charger)}
                        {peutGerer && (
                          <>
                            {(!item.statut || item.statut === 'rejete') && (
                              <button className="ml-2 text-sm font-medium text-slate-500 hover:text-brand-600" onClick={() => ouvrir(item)}>Modifier</button>
                            )}
                            {(!item.statut || item.statut === 'rejete') && (
                              <button className="ml-3 text-sm font-medium text-red-500 hover:text-red-700" onClick={() => setASupprimer(item)}>Suppr.</button>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal ouvert={Boolean(modal)} onFermer={() => setModal(null)} titre={`${modal === 'create' ? 'Ajouter' : 'Modifier'} — ${titreSingulier}`} taille="lg">
        <form onSubmit={handleSubmit(soumettre)} className="space-y-4">
          <FormChamps champs={champs} register={register} errors={errors} setFichier={setFichier} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        ouvert={Boolean(aSupprimer)}
        onFermer={() => setASupprimer(null)}
        onConfirmer={supprimer}
        titre="Confirmer la suppression"
        message={`Supprimer définitivement cet élément ?`}
        libelleConfirmer="Supprimer"
        danger
        enCours={suppression}
      />
    </div>
  );
}
