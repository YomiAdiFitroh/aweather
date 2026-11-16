import { CITIES } from '@/lib/cities';

export default function CityTabs({ selected, onSelect }) {
  return (
    <nav aria-label="Cities" className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
      {CITIES.map((city) => (
        <button
          key={city}
          onClick={() => onSelect(city)}
          className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition ${
            selected === city
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'bg-white text-slate-600 shadow-sm hover:text-blue-600'
          }`}
        >
          {city}
        </button>
      ))}
    </nav>
  );
}
