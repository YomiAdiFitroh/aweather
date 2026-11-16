import { useTemp } from '@/lib/preferences';

const W = 560;
const H = 230;
const PAD_X = 34;
const TOP = 44;
const BOTTOM = 52;

// Catmull-Rom spline converted to cubic Bezier segments for a smooth curve.
function smoothPath(pts) {
  return pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const p0 = pts[i - 2] || pts[i - 1];
      const p1 = pts[i - 1];
      const p2 = p;
      const p3 = pts[i + 1] || p;
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      return `C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
    })
    .join(' ');
}

export default function TemperatureChart({ hourly, className = '' }) {
  const { convert } = useTemp();
  const temps = hourly.map((h) => h.temp);
  const min = Math.min(...temps) - 2;
  const max = Math.max(...temps) + 2;

  const pts = hourly.map((h, i) => ({
    x: PAD_X + (i * (W - 2 * PAD_X)) / (hourly.length - 1),
    y: TOP + ((max - h.temp) / (max - min)) * (H - TOP - BOTTOM),
    ...h,
  }));

  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${H - BOTTOM} L ${pts[0].x} ${H - BOTTOM} Z`;

  return (
    <section className={`card p-6 ${className}`}>
      <h2 className="text-lg font-semibold">Temperature</h2>
      <p className="text-sm text-slate-500">Next 21 hours</p>

      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px]" role="img" aria-label="Temperature over the next 21 hours">
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#tempFill)" />
          <path d={line} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={i === 0 ? 7 : 5} fill={i === 0 ? '#2563eb' : 'white'} stroke="#3b82f6" strokeWidth="2.5" />
              <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="15" fontWeight="600" fill="#0f172a">
                {convert(p.temp)}°
              </text>
              <text x={p.x} y={H - 20} textAnchor="middle" fontSize="13" fill="#64748b">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}