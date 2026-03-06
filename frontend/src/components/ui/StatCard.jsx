export default function StatCard({ label, value, helper, accent = 'slate' }) {
  const accents = {
    slate: 'from-slate-900 to-slate-700',
    blue: 'from-blue-700 to-blue-500',
    emerald: 'from-emerald-700 to-emerald-500',
    amber: 'from-amber-700 to-amber-500',
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 bg-gradient-to-r bg-clip-text text-2xl font-semibold text-transparent ${accents[accent] || accents.slate}`}>
        {value}
      </p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </article>
  );
}
