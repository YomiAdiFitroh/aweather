import { FiCloud, FiCloudRain, FiDroplet, FiSun, FiThermometer, FiWind } from 'react-icons/fi';
import Ring from './Ring';

const tone = {
  Good: 'text-emerald-600',
  Normal: 'text-emerald-600',
  Clear: 'text-emerald-600',
  Low: 'text-emerald-600',
  Partly: 'text-sky-600',
  Moderate: 'text-amber-600',
  Breezy: 'text-amber-600',
  Humid: 'text-amber-600',
  Warmer: 'text-amber-600',
  Cooler: 'text-sky-600',
  Overcast: 'text-slate-500',
  High: 'text-red-500',
  'Very High': 'text-red-600',
  Strong: 'text-red-500',
};

const ITEMS = [
  { key: 'feelsLike', label: 'Feels Like', icon: FiThermometer, unit: '°C' },
  { key: 'windKmh', label: 'Wind', icon: FiWind, unit: 'km/h' },
  { key: 'rainChance', label: 'Rain Chance', icon: FiCloudRain, unit: '%', ring: { max: 100, color: '#38bdf8' } },
  { key: 'humidity', label: 'Humidity', icon: FiDroplet, unit: '%', ring: { max: 100, color: '#3b82f6' } },
  { key: 'uvIndex', label: 'UV Index', icon: FiSun, unit: '', ring: { max: 11, color: '#f59e0b' } },
  { key: 'cloudCover', label: 'Cloud Cover', icon: FiCloud, unit: '%', ring: { max: 100, color: '#94a3b8' } },
];

export default function Highlights({ data }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Today&apos;s Highlights</h2>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {ITEMS.map(({ key, label, icon: Icon, unit, ring }) => {
          const { value, label: status } = data[key];
          return (
            <div key={key} className="card flex items-center justify-between gap-2 p-5">
              <div>
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Icon className="text-blue-500" /> {label}
                </p>
                <p className={`text-xs font-medium ${tone[status] || 'text-slate-400'}`}>{status}</p>
                <p className="mt-3 text-3xl font-semibold">
                  {value ?? '—'}
                  <span className="ml-1 text-sm font-normal text-slate-500">{value != null ? unit : ''}</span>
                </p>
              </div>
              {ring && value != null && <Ring value={value} max={ring.max} color={ring.color} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
