import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { chantiersApi, personnelApi, presencesApi } from '../../api/endpoints';
import { fcfa, messageErreur, LIBELLES_PRESENCE } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';

const COEF = { present: 1, demi_journee: 0.5, absent_justifie: 0, absent_non_justifie: 0, conge: 0 };
const aujourdhui = () => new Date().toISOString().slice(0, 10);

export default function ChefPresences() {
  const [chantiers, setChantiers] = useState([]);
  const [idChantier, setIdChantier] = useState('');
  const [date, setDate] = useState(aujourdhui());
  const [personnel, setPersonnel] = useState([]);
  const [statuts, setStatuts] = useState({}); // { id_personnel: statut }
  const [chargementInit, setChargementInit] = useState(true);
  const [chargementFeuille, setChargementFeuille] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    chantiersApi.liste({ page: 1 })
      .then(({ data }) => {
        setChantiers(data.data);
        if (data.data.length) setIdChantier(String(data.data[0].id));
      })
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargementInit(false));
  }, []);

  const chargerFeuille = useCallback(() => {
    if (!idChantier) return;
    setChargementFeuille(true);
    Promise.all([
      personnelApi.liste({ id_chantier: idChantier, page: 1 }),
      presencesApi.liste({ id_chantier: idChantier, date_presence: date, page: 1 }),
    ])
      .then(([rPers, rPres]) => {
        const gens = rPers.data.data;
        setPersonnel(gens);
        const existant = {};
        rPres.data.data.forEach((p) => { existant[p.id_personnel] = p.statut; });
        setStatuts(Object.fromEntries(gens.map((g) => [g.id, existant[g.id] || 'present'])));
      })
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargementFeuille(false));
  }, [idChantier, date]);

  useEffect(() => { chargerFeuille(); }, [chargerFeuille]);

  const montantLigne = (p) => Number(p.taux_journalier || 0) * (COEF[statuts[p.id]] ?? 0);
  const total = personnel.reduce((s, p) => s + montantLigne(p), 0);

  const enregistrer = async () => {
    setEnregistrement(true);
    try {
      await presencesApi.batch({
        id_chantier: Number(idChantier),
        date_presence: date,
        presences: personnel.map((p) => ({ id_personnel: p.id, statut: statuts[p.id] })),
      });
      toast.success('Feuille de présence enregistrée.');
      chargerFeuille();
    } catch (e) {
      toast.error(messageErreur(e));
    } finally {
      setEnregistrement(false);
    }
  };

  if (chargementInit) return <Spinner />;

  return (
    <div>
      <PageHeader titre="Feuille de présence" sousTitre="Pointez votre personnel et suivez la paie en temps réel" />

      <div className="card mb-4 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <div>
          <label className="label">Chantier</label>
          <select className="input" value={idChantier} onChange={(e) => setIdChantier(e.target.value)}>
            {chantiers.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} max={aujourdhui()} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {chargementFeuille ? (
        <Spinner />
      ) : personnel.length === 0 ? (
        <EmptyState titre="Aucun personnel" description="Ajoutez du personnel à ce chantier avant de pointer." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Personnel</th>
                  <th className="table-th">Poste</th>
                  <th className="table-th">Taux/jour</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th text-right">Montant dû</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {personnel.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="table-td font-medium text-slate-800">{p.nom_complet}</td>
                    <td className="table-td">{p.poste}</td>
                    <td className="table-td whitespace-nowrap">{fcfa(p.taux_journalier)}</td>
                    <td className="table-td">
                      <select
                        className="input py-1.5"
                        value={statuts[p.id] || 'present'}
                        onChange={(e) => setStatuts((s) => ({ ...s, [p.id]: e.target.value }))}
                      >
                        {Object.entries(LIBELLES_PRESENCE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td className="table-td whitespace-nowrap text-right font-semibold">{fcfa(montantLigne(p))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={4} className="table-td text-right font-semibold text-slate-600">Total paie du jour</td>
                  <td className="table-td whitespace-nowrap text-right text-base font-bold text-brand-600">{fcfa(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
            <button className="btn-primary" onClick={enregistrer} disabled={enregistrement}>
              {enregistrement ? 'Enregistrement…' : 'Enregistrer la feuille'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
