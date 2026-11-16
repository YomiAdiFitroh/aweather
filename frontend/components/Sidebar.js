'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiBell, FiCloud, FiHome, FiLogOut, FiMap, FiMapPin, FiSettings, FiUsers, FiX } from 'react-icons/fi';
import { useAuth } from '@/lib/auth-context';
import { usePreferences } from '@/lib/preferences';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: FiHome },
  { label: 'Forecast', href: '/forecast', icon: FiCloud },
  { label: 'Map', href: '/map', icon: FiMap },
  { label: 'Cities', href: '/cities', icon: FiMapPin },
  { label: 'Alerts', href: '/alerts', icon: FiBell },
  { label: 'Users', href: '/users', icon: FiUsers },
  { label: 'Settings', href: '/settings', icon: FiSettings },
];

export default function Sidebar({ open, onClose }) {
  const { city } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white/95 p-5 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-xl font-bold text-blue-700">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-xl text-blue-600">
              <FiCloud />
            </span>
            Aweather
          </span>
          <button onClick={onClose} className="text-xl text-slate-500 lg:hidden" aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <nav className="space-y-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href && pathname === href;
            const base = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium';
            if (!href) {
              return (
                <span key={label} title="Coming soon" className={`${base} cursor-not-allowed text-slate-400`}>
                  <Icon className="text-lg" /> {label}
                </span>
              );
            }
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`${base} transition ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <Icon className="text-lg" /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-200/70 p-4">
          <p className="text-xs text-slate-500">My Location</p>
          <p className="font-semibold">{city}, ID</p>
        </div>

        <button
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <FiLogOut className="text-lg" /> Log out
        </button>
      </aside>
    </>
  );
}
