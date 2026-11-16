const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function nowMinutes() {
  const t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Jakarta' });
  return toMinutes(t);
}

export default function SunCard({ sun }) {
  const rise = toMinutes(sun.sunrise);
  const set = toMinutes(sun.sunset);
  const now = nowMinutes();
  const p = Math.min(1, Math.max(0, (now - rise) / (set - rise)));
  const daytime = now > rise && now < set;

  const angle = Math.PI * (1 - p);
  const sx = 100 + 80 * Math.cos(angle);
  const sy = 100 - 80 * Math.sin(angle);

  const left = set - now;
  const status = daytime ? `${Math.floor(left / 60)}h ${left % 60}m of daylight left` : 'The sun is down';

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold">Sunrise &amp; Sunset</h2>
      <svg viewBox="0 0 200 112" className="mx-auto mt-2 w-full max-w-[260px]" role="img" aria-label={status}>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${p * 100} 100`}
        />
        <circle cx={sx} cy={sy} r="9" fill="#fbbf24" stroke="white" strokeWidth="3" />
      </svg>
      <p className="-mt-2 text-center text-sm font-medium text-slate-600">{status}</p>
      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="text-slate-500">Sunrise</p>
          <p className="font-semibold">{sun.sunrise}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500">Sunset</p>
          <p className="font-semibold">{sun.sunset}</p>
        </div>
      </div>
    </section>
  );
}
