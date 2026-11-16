'use client';

import { useState } from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { ErrorBanner, LoadingBlock } from '@/components/PageState';
import { CITIES } from '@/lib/cities';
import { useApi } from '@/lib/useApi';

const STYLES = {
  warning: { icon: FiAlertTriangle, label: 'Warning', box: 'border-red-400 bg-red-50', text: 'text-red-600' },
  advisory: { icon: FiAlertCircle, label: 'Advisory', box: 'border-amber-400 bg-amber-50', text: 'text-amber-600' },
  info: { icon: FiInfo, label: 'Info', box: 'border-sky-400 bg-sky-50', text: 'text-sky-600' },
};

export default function AlertsPage() {
  const { data, error } = useApi('/weather/alerts');
  const [filter, setFilter] = useState('All');

  const alerts = (data?.alerts ?? []).filter((a) => filter === 'All' || a.city === filter);

  return (
    <section>
      <h2 className="text-lg font-semibold">Weather alerts</h2>
      <p className="mb-4 text-sm text-slate-500">Generated from current conditions and the short-range forecast.</p>

      <nav aria-label="Filter by city" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {['All', ...CITIES].map((name) => (
          <button
            key={name}
            onClick={() => setFilter(name)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === name ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white text-slate-600 shadow-sm hover:text-blue-600'
            }`}
          >
            {name}
          </button>
        ))}
      </nav>

      <ErrorBanner message={error} />
      {!data && !error && <LoadingBlock height="h-48" />}

      {data && alerts.length === 0 && (
        <div className="card flex flex-col items-center gap-2 p-10 text-center text-slate-500">
          <FiCheckCircle className="text-4xl text-emerald-500" />
          <p className="font-medium text-slate-700">No active alerts</p>
          <p className="text-sm">{filter === 'All' ? 'All cities look calm right now.' : `${filter} looks calm right now.`}</p>
        </div>
      )}

      <ul className="space-y-3">
        {alerts.map((a) => {
          const { icon: Icon, label, box, text } = STYLES[a.severity];
          return (
            <li key={a.id} className={`flex gap-4 rounded-2xl border-l-4 p-5 shadow-sm ${box}`}>
              <Icon className={`mt-0.5 shrink-0 text-2xl ${text}`} aria-hidden="true" />
              <div>
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{a.title}</span>
                  <span className={`rounded-full bg-white px-2 py-0.5 text-xs font-medium ${text}`}>{label}</span>
                  <span className="text-sm text-slate-500">{a.city}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">{a.message}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}