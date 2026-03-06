import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/companies', label: 'Companies' },
  { to: '/signals', label: 'Signals' },
  { to: '/graph', label: 'Relationship Graph' },
  { to: '/watchlist', label: 'Watchlist' },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition',
          isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Stock Intelligence</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">Relationship Desk</h1>
          <p className="mt-2 text-xs text-slate-500">For research purposes only.</p>
          <nav className="mt-8 space-y-1">
            {links.map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} />
            ))}
          </nav>
          <p className="mt-10 text-xs text-slate-400">Synthetic dataset | {year}</p>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Stock Intelligence</p>
                <h1 className="text-sm font-semibold text-slate-900">Relationship Desk</h1>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {isOpen ? 'Close' : 'Menu'}
              </button>
            </div>
            {isOpen && (
              <nav className="space-y-1 border-t border-slate-200 px-4 py-3">
                {links.map((link) => (
                  <NavItem key={link.to} to={link.to} label={link.label} onClick={() => setIsOpen(false)} />
                ))}
              </nav>
            )}
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
