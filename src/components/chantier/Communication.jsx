import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { messagesApi } from '../../api/endpoints';
import { messageErreur, dateHeure } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../Spinner';
import EmptyState from '../EmptyState';

export default function Communication({ idChantier }) {
  const { utilisateur } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [contenu, setContenu] = useState('');
  const [fichier, setFichier] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef(null);
  const fichierRef = useRef(null);

  const charger = useCallback(() => {
    messagesApi.liste(idChantier, { page: 1 })
      .then(({ data }) => setMessages([...data.data].reverse()))
      .catch((e) => toast.error(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [idChantier]);

  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { finRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!contenu.trim() && !fichier) return;
    setEnvoi(true);
    try {
      await messagesApi.envoyer(idChantier, {
        contenu: contenu.trim() || ' ',
        ...(fichier && { fichier_joint: fichier }),
      });
      setContenu('');
      setFichier(null);
      if (fichierRef.current) fichierRef.current.value = '';
      charger();
    } catch (err) {
      toast.error(messageErreur(err));
    } finally {
      setEnvoi(false);
    }
  };

  const estImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  if (chargement) return <Spinner />;

  return (
    <div className="flex flex-col">
      <div className="card mb-3 max-h-96 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState titre="Aucun message" description="Démarrez la conversation ci-dessous." />
        ) : (
          messages.map((m) => {
            const aMoi = m.id_expediteur === utilisateur?.id;
            return (
              <div key={m.id} className={`flex ${aMoi ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${aMoi ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {!aMoi && <p className="mb-0.5 text-xs font-semibold opacity-80">{m.expediteur?.nom_complet || 'Utilisateur'}</p>}
                  {m.contenu?.trim() && <p className="whitespace-pre-wrap">{m.contenu}</p>}
                  {m.fichier_joint_url && (
                    estImage(m.fichier_joint_url) ? (
                      <a href={m.fichier_joint_url} target="_blank" rel="noreferrer">
                        <img
                          src={m.fichier_joint_url}
                          alt="pièce jointe"
                          className="mt-2 max-h-48 rounded-lg object-cover"
                        />
                      </a>
                    ) : (
                      <a
                        href={m.fichier_joint_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-1 flex items-center gap-1 text-xs underline ${aMoi ? 'text-white/80' : 'text-brand-600'}`}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Pièce jointe
                      </a>
                    )
                  )}
                  <p className={`mt-1 text-[10px] ${aMoi ? 'text-white/70' : 'text-slate-400'}`}>{dateHeure(m.date_envoi)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={finRef} />
      </div>

      {/* Aperçu fichier sélectionné */}
      {fichier && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="flex-1 truncate">{fichier.name}</span>
          <button
            type="button"
            onClick={() => { setFichier(null); if (fichierRef.current) fichierRef.current.value = ''; }}
            className="text-slate-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={envoyer} className="flex gap-2">
        {/* Bouton pièce jointe */}
        <button
          type="button"
          onClick={() => fichierRef.current?.click()}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
          title="Joindre un fichier"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={fichierRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => setFichier(e.target.files[0] || null)}
        />

        <input
          className="input flex-1"
          placeholder="Écrire un message…"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={envoi || (!contenu.trim() && !fichier)}
        >
          {envoi ? 'Envoi…' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}