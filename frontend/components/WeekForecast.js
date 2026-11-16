import { useTemp } from '@/lib/preferences';
import WeatherIcon from './WeatherIcon';

export default function WeekForecast({ daily }) {
  const { convert } = useTemp();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">This week</h2>
      <ul className="space-y-3">
        {daily.map((d, i) => {
          const today = i === 0;
          return (
            <li
              key={d.date}
              className={`flex items-center gap-3 rounded-2xl p-4 ${
                today
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'card'
              }`}
            >
              <WeatherIcon condition={d.condition} size={44} light={today} />
              <div className="flex-1">
                <p className="font-semibold">{d.label}</p>
                <p className={`text-xs ${today ? 'text-blue-100' : 'text-slate-500'}`}>{d.date}</p>
              </div>
              <p className="text-2xl font-semibold">
                {convert(d.max)}°<span className={`ml-1 text-sm font-normal ${today ? 'text-blue-100' : 'text-slate-400'}`}>{convert(d.min)}°</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}