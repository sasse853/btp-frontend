import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { chantiersApi, rapportsApi } from '../../api/endpoints';
import { messageErreur } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';

const SECTIONS = [
  { cle: 'infos', libelle: 'Informations générales' },
  { cle: 'avancement', libelle: 'Avancement & synthèse' },
  { cle: 'finances', libelle: 'Synthèse financière' },
  { cle: 'personnel', libelle: 'Personnel' },
  { cle: 'materiaux', libelle: 'Matériaux' },
  { cle: 'equipements', libelle: 'Équipements' },
  { cle: 'documents', libelle: 'Documents clés' },
  { cle: 'observations', libelle: 'Observations' },
];

export default function AdminRapports() {
  const [chantiers, setChantiers] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [idChantier, setIdChantier] = useState('');
  const [sections, setSections] = useState(SECTIONS.map((s) => s.cle));
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [observations, setObservations] = useState('');
  const [archiver, setArchiver] = useState(false);
  const [generation, setGeneration] = useState(false);

  useEffect(() => {
    chantiersApi.liste({ page: 1 })
      .then(({ data }) => setChantiers(data.data))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, []);

  const basculerSection = (cle) =>
    setSections((prev) => (prev.includes(cle) ? prev.filter((s) => s !== cle) : [...prev, cle]));

  const generer = async () => {
    if (!idChantier) { toast.warn('Sélectionnez un chantier.'); return; }
    setGeneration(true);
    try {
      const { data } = await rapportsApi.generer(idChantier, {
        sections,
        date_debut: dateDebut || null,
        date_fin: dateFin || null,
        observations: observations || null,
        archiver,
      });
      const chantier = chantiers.find((c) => c.id === Number(idChantier));
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${chantier?.reference || idChantier}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Rapport généré.');
    } catch (e) {
      toast.error(messageErreur(e));
    } finally {
      setGeneration(false);
    }
  };

  if (chargement) return <Spinner />;

  return (
    <div>
      <PageHeader titre="Rapports client" sousTitre="Générez un rapport PDF personnalisé par chantier" />

      <div className="card max-w-3xl space-y-5 p-6">
        <div>
          <label className="label">Chantier *</label>
          <select className="input" value={idChantier} onChange={(e) => setIdChantier(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {chantiers.map((c) => <option key={c.id} value={c.id}>{c.nom} ({c.reference})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Période — début</label>
            <input type="date" className="input" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </div>
          <div>
            <label className="label">Période — fin</label>
            <input type="date" className="input" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Sections à inclure</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <label key={s.cle} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={sections.includes(s.cle)} onChange={() => basculerSection(s.cle)} />
                {s.libelle}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Observations (optionnel)</label>
          <textarea rows={3} className="input" value={observations} onChange={(e) => setObservations(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={archiver} onChange={(e) => setArchiver(e.target.checked)} />
          Archiver une copie dans les documents du chantier
        </label>

        <div className="flex justify-end pt-1">
          <button className="btn-primary" onClick={generer} disabled={generation}>
            {generation ? 'Génération…' : 'Générer le PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
