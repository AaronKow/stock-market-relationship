export default function SignalBadge({ sentiment }) {
  const value = String(sentiment || '').toUpperCase();
  const tone = {
    POSITIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    NEUTRAL: 'bg-slate-100 text-slate-700 border-slate-200',
    NEGATIVE: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone[value] || tone.NEUTRAL}`}>
      {value || 'UNKNOWN'}
    </span>
  );
}
