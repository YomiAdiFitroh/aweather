import { FiCloud, FiDroplet, FiVolume2, FiWind } from 'react-icons/fi';
import { MdWeekend } from 'react-icons/md';

export default function IndoorConditions({ data }) {
  const stats = [
    { icon: FiDroplet, label: 'Humidity', value: `${data.humidity}%`, color: 'text-sky-500' },
    { icon: FiWind, label: 'Air Quality', value: data.airQuality, color: 'text-blue-500' },
    { icon: FiCloud, label: 'CO₂', value: `${data.co2} ppm`, color: 'text-emerald-500' },
    { icon: FiVolume2, label: 'Noise Level', value: `${data.noise} dB`, color: 'text-slate-500' },
  ];

  return (
    <section className="card p-6">
      <h2 className="mb-4 text-lg font-semibold">Indoor Conditions</h2>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-blue-100 text-blue-400">
            <MdWeekend size={44} />
          </span>
          <div>
            <div className="flex items-start">
              <span className="text-6xl font-extralight leading-none">{data.temp}</span>
              <span className="mt-1 text-2xl font-light text-slate-500">°C</span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {data.comfort}
            </p>
          </div>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">
              <Icon className={`text-xl ${color}`} />
              <div>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-sm font-semibold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
