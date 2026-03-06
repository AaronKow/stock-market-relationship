function getTone(score) {
  if (score >= 75) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (score >= 55) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

export default function ScoreBadge({ score, label = 'Score' }) {
  const safeScore = Number(score) || 0;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getTone(safeScore)}`}>
      {label}: {safeScore.toFixed(1)}
    </span>
  );
}
