// Rendu generique de champs de formulaire pilote par une configuration.
// champ : { nom, libelle, type, options?, required?, step?, accept?, pleine? }
export default function FormChamps({ champs, register, errors, setFichier }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {champs.map((champ) => {
        const regle = champ.required ? { required: `${champ.libelle} requis.` } : {};
        if (champ.type === 'number') regle.valueAsNumber = false;

        return (
          <div key={champ.nom} className={champ.pleine ? 'sm:col-span-2' : ''}>
            <label className="label">{champ.libelle}{champ.required && ' *'}</label>

            {champ.type === 'select' ? (
              <select className="input" {...register(champ.nom, regle)}>
                <option value="">— Sélectionner —</option>
                {champ.options.map((o) => (
                  <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
                ))}
              </select>
            ) : champ.type === 'textarea' ? (
              <textarea rows={3} className="input" {...register(champ.nom, regle)} />
            ) : champ.type === 'file' ? (
              <input
                type="file"
                accept={champ.accept || '.pdf,.jpg,.jpeg,.png'}
                className="input"
                onChange={(e) => setFichier(champ.nom, e.target.files?.[0] || null)}
              />
            ) : (
              <input
                type={champ.type || 'text'}
                step={champ.step}
                className="input"
                {...register(champ.nom, regle)}
              />
            )}

            {errors[champ.nom] && <p className="mt-1 text-xs text-red-600">{errors[champ.nom].message}</p>}
          </div>
        );
      })}
    </div>
  );
}
