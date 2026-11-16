'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CITIES } from '@/lib/cities';
import { usePreferences } from '@/lib/preferences';

function Section({ title, description, children }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mb-4 text-sm text-slate-500">{description}</p>}
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unit, setUnit, defaultCity, setDefaultCity } = usePreferences();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signOutEverywhere() {
    setBusy(true);
    setError('');
    try {
      await api('/auth/logout-all', { method: 'POST' });
      await logout();
      router.replace('/login');
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="max-w-2xl space-y-6">
      <Section title="Account">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-slate-600">{user?.email}</p>
            <p className="text-xs text-slate-500">Member since {joined}</p>
          </div>
        </div>
      </Section>

      <Section title="Preferences" description="Saved in this browser.">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium">Temperature unit</p>
            <div role="radiogroup" aria-label="Temperature unit" className="inline-flex rounded-xl bg-slate-100 p-1">
              {['C', 'F'].map((u) => (
                <button
                  key={u}
                  role="radio"
                  aria-checked={unit === u}
                  onClick={() => setUnit(u)}
                  className={`rounded-lg px-5 py-1.5 text-sm font-medium transition ${unit === u ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}
                >
                  °{u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="default-city" className="mb-2 block text-sm font-medium">
              Default city
            </label>
            <select id="default-city" className="input max-w-xs" value={defaultCity} onChange={(e) => setDefaultCity(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">Shown first each time you open Aweather.</p>
          </div>
        </div>
      </Section>

      <Section title="Security" description="Sign out every browser and device where you are logged in, including this one.">
        {error && (
          <p role="alert" className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
            Sign out of all devices
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">Are you sure?</span>
            <button
              onClick={signOutEverywhere}
              disabled={busy}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {busy ? 'Signing out…' : 'Yes, sign out everywhere'}
            </button>
            <button onClick={() => setConfirming(false)} disabled={busy} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}