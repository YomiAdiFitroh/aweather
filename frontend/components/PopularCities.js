import { useTemp } from '@/lib/preferences';
import WeatherIcon from './WeatherIcon';

export default function PopularCities({ cities, selected, onSelect }) {
  const { convert, unit } = useTemp();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Other Cities</h2>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {cities.map((c) => (
          <button
            key={c.city}
            onClick={() => onSelect(c.city)}
            className={`card flex items-center gap-4 p-4 text-left transition hover:shadow-md ${
              selected === c.city ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <WeatherIcon condition={c.condition} size={38} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{c.city}</span>
              <span className="block text-3xl font-light leading-tight">
                {convert(c.temp)}°<span className="text-base text-slate-500">{unit}</span>
              </span>
              <span className="block text-xs text-slate-500">
                {c.condition} · H:{convert(c.high)}° L:{convert(c.low)}°
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}