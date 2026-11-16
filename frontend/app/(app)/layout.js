'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

// Client-side route guard: everything inside (app)/ requires a signed-in user.
// Real protection is on the API, where every data endpoint checks the JWT.
export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>
    );
  }

  return (
    <>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="p-4 sm:p-6 lg:ml-64 lg:p-8">
        <Header onMenu={() => setMenuOpen(true)} />
        {children}
      </main>
    </>
  );
}
