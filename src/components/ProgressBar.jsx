export default function ProgressBar({ valeur = 0, libelle, seuilAlerte = 80 }) {
  const pct = Math.min(100, Math.max(0, Number(valeur)));
  const enAlerte = pct >= seuilAlerte;

  return (
    <div>
      {libelle && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>{libelle}</span>
          <span className={enAlerte ? 'font-semibold text-red-600' : 'font-semibold text-slate-700'}>
            {pct.toFixed(0)} %
          </span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${enAlerte ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
