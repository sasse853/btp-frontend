import { useRef, useState } from 'react';

export default function FileUpload({ onChange, accept = '.pdf,.jpg,.jpeg,.png', libelle = 'Joindre un fichier' }) {
  const inputRef = useRef(null);
  const [nomFichier, setNomFichier] = useState('');

  const gerer = (e) => {
    const fichier = e.target.files?.[0] || null;
    setNomFichier(fichier?.name || '');
    onChange(fichier);
  };

  return (
    <div>
      <button
        type="button"
        className="btn-secondary w-full"
        onClick={() => inputRef.current?.click()}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {nomFichier || libelle}
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={gerer} />
    </div>
  );
}
