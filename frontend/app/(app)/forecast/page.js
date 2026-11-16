'use client';

import CityTabs from '@/components/CityTabs';
import { ErrorBanner, LoadingBlock } from '@/components/PageState';
import TemperatureChart from '@/components/TemperatureChart';
import WeatherIcon from '@/components/WeatherIcon';
import { usePreferences, useTemp } from '@/lib/preferences';
import { useApi } from '@/lib/useApi';

export default function ForecastPage() {
  const { city, setCity, ready } = usePreferences();
  const { convert, unit } = useTemp();
  const { data, error, loading } = useApi(ready ? `/weather/dashboard?city=${encodeURIComponent(city)}` : null);

  const daily = data?.daily ?? [];
  const weekMin = Math.min(...daily.map((d) => d.min));
  const weekMax = Math.max(...daily.map((d) => d.max));
  const span = weekMax - weekMin || 1;

  return (
    <>
      <CityTabs selected={city} onSelect={setCity} />
      <ErrorBanner message={error} />
      {!data && !error && <LoadingBlock height="h-[28rem]" />}

      {data && (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <TemperatureChart hourly={data.hourly} />

          <section className="card p-6">
            <h2 className="text-lg font-semibold">{daily.length}-day forecast</h2>
            <p className="mb-4 text-sm text-slate-500">
              {data.location.city} · temperatures in °{unit}
            </p>

            <ul className="divide-y divide-slate-100">
              {daily.map((d, i) => (
                <li key={d.date} className="flex items-center gap-4 py-3">
                  <div className="w-28 shrink-0 sm:w-36">
                    <p className="font-semibold">{d.label}</p>
                    <p className="text-xs text-slate-500">{d.date}</p>
                  </div>
                  <WeatherIcon condition={d.condition} size={40} />
                  <p className="hidden w-28 text-sm text-slate-600 sm:block">{d.condition}</p>

                  <span className="w-9 text-right text-sm text-slate-500">{convert(d.min)}°</span>
                  <div className="relative h-2 flex-1 rounded-full bg-slate-100" aria-hidden="true">
                    <div
                      className={`absolute h-2 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-blue-400'}`}
                      style={{ left: `${((d.min - weekMin) / span) * 100}%`, width: `${Math.max(((d.max - d.min) / span) * 100, 6)}%` }}
                    />
                  </div>
                  <span className="w-9 text-sm font-semibold">{convert(d.max)}°</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}