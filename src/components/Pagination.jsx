export default function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page } = meta;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
      <span className="text-slate-500">
        Page {current_page} sur {last_page}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary px-3 py-1.5"
          disabled={current_page <= 1}
          onClick={() => onChange(current_page - 1)}
        >
          Précédent
        </button>
        <button
          type="button"
          className="btn-secondary px-3 py-1.5"
          disabled={current_page >= last_page}
          onClick={() => onChange(current_page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
