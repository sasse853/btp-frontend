import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { dateHeure } from '../utils/format';
import logoHorizontal from '../assets/logo/logo-horizontal.png';

const LIENS = {
  admin: [
    { to: '/admin', libelle: 'Tableau de bord', exact: true, icone: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/admin/chantiers', libelle: 'Chantiers', icone: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { to: '/admin/validations', libelle: 'Validations', icone: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to: '/admin/rapports', libelle: 'Rapports', icone: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to: '/admin/utilisateurs', libelle: 'Utilisateurs', icone: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/admin/profil', libelle: 'Mon profil', icone: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ],
  chef_chantier: [
    { to: '/chef', libelle: 'Tableau de bord', exact: true, icone: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/chef/chantiers', libelle: 'Mes chantiers', icone: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { to: '/chef/presences', libelle: 'Présences & paie', icone: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-6 0M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/chef/profil', libelle: 'Mon profil', icone: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ],
};

function Cloche() {
  const { items, nonLues, toutMarquerLu } = useNotifications();
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {nonLues > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOuvert(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">Notifications</span>
              {nonLues > 0 && (
                <button
                  onClick={() => { toutMarquerLu(); }}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Aucune notification</p>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-slate-50 px-4 py-3 text-sm ${!n.lu ? 'bg-brand-50' : ''}`}
                  >
                    <p className="font-medium text-slate-700">{n.titre || n.message}</p>
                    {n.message && n.titre && (
                      <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Layout() {
  const { utilisateur, role, seDeconnecter } = useAuth();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);
  const liens = LIENS[role] || [];

  const deconnexion = async () => {
    await seDeconnecter();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-200 transition-transform lg:static lg:translate-x-0 ${
          ouvert ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-slate-800 px-5">
          <img src={logoHorizontal} alt="K.Mazar Groupe" className="h-9 w-auto" />
        </div>
        <nav className="space-y-1 p-3">
          {liens.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.exact}
              onClick={() => setOuvert(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={lien.icone} />
              </svg>
              {lien.libelle}
            </NavLink>
          ))}
        </nav>
      </aside>

      {ouvert && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setOuvert(false)} />}

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setOuvert(true)}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden text-sm text-slate-500 sm:block">{dateHeure(new Date())}</div>
          <div className="flex items-center gap-3">
            <Cloche />
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-800">{utilisateur?.nom_complet}</p>
                <p className="text-xs text-slate-500">{role === 'admin' ? 'Administrateur' : 'Chef de chantier'}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {(utilisateur?.prenom?.[0] || '') + (utilisateur?.nom?.[0] || '')}
              </div>
              <button type="button" onClick={deconnexion} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600" title="Déconnexion">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
