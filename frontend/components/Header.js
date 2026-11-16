'use client';

import { FiBell, FiMenu } from 'react-icons/fi';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Header({ onMenu }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <header className="mb-6 flex items-center gap-3">
      <button onClick={onMenu} className="card flex h-11 w-11 items-center justify-center text-xl lg:hidden" aria-label="Open menu">
        <FiMenu />
      </button>
      <div className="mr-auto">
        <p className="text-sm text-slate-500">{greeting()},</p>
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{firstName}!</h1>
      </div>
      <Link href="/alerts" className="card flex h-11 w-11 items-center justify-center text-lg text-slate-600 transition hover:text-blue-600" aria-label="Weather alerts">
        <FiBell />
      </Link>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 font-semibold text-white">
        {firstName.charAt(0).toUpperCase()}
      </span>
    </header>
  );
}
