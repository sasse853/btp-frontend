export default function PageHeader({ titre, sousTitre, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-800 lg:text-2xl">{titre}</h1>
        {sousTitre && <p className="mt-0.5 text-sm text-slate-500">{sousTitre}</p>}
      </div>
      {action}
    </div>
  );
}
