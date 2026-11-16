'use client';

import { useRouter } from 'next/navigation';
import { FiDroplet, FiWind, FiCloudRain } from 'react-icons/fi';
import { ErrorBanner, LoadingBlock } from '@/components/PageState';
import WeatherIcon from '@/components/WeatherIcon';
import { usePreferences, useTemp } from '@/lib/preferences';
import { useApi } from '@/lib/useApi';

export default function CitiesPage() {
  const router = useRouter();
  const { city: selected, setCity } = usePreferences();
  const { convert, unit } = useTemp();
  const { data, error } = useApi('/weather/cities');

  function open(city) {
    setCity(city);
    router.push('/dashboard');
  }

  const cities = data?.cities ?? [];
  const warmest = cities.length ? cities.reduce((a, b) => (b.temp > a.temp ? b : a)).city : null;
  const coolest = cities.length ? cities.reduce((a, b) => (b.temp < a.temp ? b : a)).city : null;
  const rainiest = cities.length ? cities.reduce((a, b) => (b.rainChance > a.rainChance ? b : a)).city : null;

  return (
    <section>
      <h2 className="text-lg font-semibold">Cities</h2>
      <p className="mb-4 text-sm text-slate-500">Compare conditions and open any city on the dashboard.</p>

      <ErrorBanner message={error} />
      {!data && !error && <LoadingBlock height="h-72" />}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          {cities.map((c) => {
            const tags = [c.city === warmest && 'Warmest', c.city === coolest && 'Coolest', c.city === rainiest && 'Most rain'].filter(Boolean);
            return (
              <button
                key={c.city}
                onClick={() => open(c.city)}
                className={`card p-6 text-left transition hover:shadow-md ${selected === c.city ? 'ring-2 ring-blue-400' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{c.city}</p>
                    <p className="text-sm text-slate-500">{c.condition}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span key={t} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <WeatherIcon condition={c.condition} size={64} />
                </div>

                <p className="mt-4 text-5xl font-extralight">
                  {convert(c.temp)}°<span className="text-xl text-slate-500">{unit}</span>
                </p>
                <p className="text-sm text-slate-500">
                  H: {convert(c.high)}° · L: {convert(c.low)}°
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FiDroplet className="text-sky-500" />
                    <div>
                      <dt className="text-xs text-slate-500">Humidity</dt>
                      <dd className="font-semibold">{c.humidity}%</dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiWind className="text-blue-500" />
                    <div>
                      <dt className="text-xs text-slate-500">Wind</dt>
                      <dd className="font-semibold">{c.windKmh} km/h</dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCloudRain className="text-sky-500" />
                    <div>
                      <dt className="text-xs text-slate-500">Rain</dt>
                      <dd className="font-semibold">{c.rainChance}%</dd>
                    </div>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}