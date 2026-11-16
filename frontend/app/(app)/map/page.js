'use client';

import { FiExternalLink } from 'react-icons/fi';
import { ErrorBanner } from '@/components/PageState';
import WeatherIcon from '@/components/WeatherIcon';
import { CITIES, CITY_COORDS } from '@/lib/cities';
import { usePreferences, useTemp } from '@/lib/preferences';
import { useApi } from '@/lib/useApi';

export default function MapPage() {
  const { city, setCity } = usePreferences();
  const { convert, unit } = useTemp();
  const { data, error } = useApi('/weather/cities');

  const { lat, lon } = CITY_COORDS[city];
  const bbox = [lon - 0.12, lat - 0.08, lon + 0.12, lat + 0.08].join(',');
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const full = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`;

  const weather = data?.cities.find((c) => c.city === city);

  return (
    <section>
      <h2 className="text-lg font-semibold">Map</h2>
      <p className="mb-4 text-sm text-slate-500">Pick a city to see where it is and what the weather is like there.</p>
      <ErrorBanner message={error} />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {CITIES.map((name) => {
            const c = data?.cities.find((x) => x.city === name);
            return (
              <li key={name}>
                <button
                  onClick={() => setCity(name)}
                  className={`card flex w-full items-center gap-3 p-3 text-left transition hover:shadow-md ${city === name ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    {c ? <WeatherIcon condition={c.condition} size={30} /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{name}</span>
                    <span className="block text-sm text-slate-500">{c ? `${convert(c.temp)}°${unit} · ${c.condition}` : '…'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="card relative overflow-hidden">
          <iframe
            key={city}
            title={`Map of ${city}`}
            src={embed}
            className="h-[28rem] w-full border-0 lg:h-[34rem]"
            loading="lazy"
          />
          {weather && (
            <div className="absolute left-4 top-4 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
              <WeatherIcon condition={weather.condition} size={40} />
              <div>
                <p className="text-sm font-semibold">{city}</p>
                <p className="text-xs text-slate-500">
                  {convert(weather.temp)}°{unit} · {weather.condition}
                </p>
              </div>
            </div>
          )}
          <a
            href={full}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-blue-600 shadow"
          >
            View larger map <FiExternalLink />
          </a>
        </div>
      </div>
    </section>
  );
}