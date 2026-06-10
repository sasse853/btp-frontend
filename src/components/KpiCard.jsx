export default function KpiCard({ libelle, valeur, sousTexte, couleur = 'brand', icone }) {
  const tons = {
    brand: 'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }[couleur];

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tons}`}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icone} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{libelle}</p>
        <p className="truncate text-lg font-bold text-slate-800">{valeur}</p>
        {sousTexte && <p className="text-xs text-slate-400">{sousTexte}</p>}
      </div>
    </div>
  );
}
