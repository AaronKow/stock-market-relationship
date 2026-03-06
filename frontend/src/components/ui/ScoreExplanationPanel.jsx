import Card from './Card';

function formatPercent(value) {
  if (typeof value !== 'number') {
    return null;
  }
  return `${(value * 100).toFixed(0)}%`;
}

export default function ScoreExplanationPanel({ snapshot }) {
  if (!snapshot) {
    return (
      <Card title="Score Explanation" subtitle="Latest model context">
        <p className="text-sm text-slate-500">No score snapshot is available for this company yet.</p>
      </Card>
    );
  }

  const breakdown = snapshot.scoreBreakdown || {};
  const weights = breakdown.weights || {};
  const explanation = snapshot.explanationJson || snapshot.explanation || null;

  return (
    <Card title="Score Explanation" subtitle="Latest model context">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Relationship</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number(snapshot.relationshipScore || 0).toFixed(1)}</p>
          {formatPercent(weights.relationship) && <p className="text-xs text-slate-500">Weight: {formatPercent(weights.relationship)}</p>}
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Signals</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number(snapshot.signalScore || 0).toFixed(1)}</p>
          {formatPercent(weights.signal) && <p className="text-xs text-slate-500">Weight: {formatPercent(weights.signal)}</p>}
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Earnings</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number(snapshot.earningsScore || 0).toFixed(1)}</p>
          {formatPercent(weights.earnings) && <p className="text-xs text-slate-500">Weight: {formatPercent(weights.earnings)}</p>}
        </div>
      </div>

      {explanation && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-800">Notes</p>
          <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-600">
            {JSON.stringify(explanation, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}
