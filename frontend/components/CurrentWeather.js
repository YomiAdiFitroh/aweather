import { FiMapPin } from 'react-icons/fi';
import WeatherIcon from './WeatherIcon';

const dateFormat = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' };

export default function CurrentWeather({ data, className = '' }) {
  const { location, date, current } = data;

  return (
    <section
      className={`relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white shadow-lg shadow-blue-500/25 sm:p-7 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <FiMapPin /> {location.city}, Indonesia
      </div>
      <p className="text-sm text-blue-100">{new Date(date).toLocaleDateString('en-GB', dateFormat)}</p>

      <WeatherIcon condition={current.condition} size={120} light className="absolute -right-1 top-3" />

      <div className="mt-8 flex items-start">
        <span className="text-8xl font-extralight leading-none">{current.temp}</span>
        <span className="mt-2 text-3xl font-light text-blue-100">°C</span>
      </div>
      <p className="mt-3 text-2xl font-light">{current.condition}</p>
      <p className="text-sm text-blue-100">
        H: {current.high}° &nbsp; L: {current.low}°
      </p>

      <div className="mt-auto pt-8">
        <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-white/15 p-4 text-sm backdrop-blur-sm">
          <div>
            <dt className="text-blue-100">Pressure</dt>
            <dd className="font-semibold">{current.pressure} hPa</dd>
          </div>
          <div>
            <dt className="text-blue-100">Visibility</dt>
            <dd className="font-semibold">{current.visibilityKm} km</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
