import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import ScoreBadge from '../components/ui/ScoreBadge';
import StatCard from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';

function number(value) {
  return Number(value) || 0;
}

export default function DashboardPage() {
  const [data, setData] = useState({ companies: [], signals: [], relationships: [], scores: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [companies, signals, relationships, scores] = await Promise.all([
        apiFetch('/companies'),
        apiFetch('/signals?limit=200'),
        apiFetch('/relationships'),
        apiFetch('/scores/top?limit=5'),
      ]);

      setData({
        companies: Array.isArray(companies) ? companies : [],
        signals: Array.isArray(signals) ? signals : [],
        relationships: Array.isArray(relationships) ? relationships : [],
        scores: Array.isArray(scores) ? scores : [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const avgScore = useMemo(() => {
    if (!data.scores.length) {
      return '0.0';
    }
    const total = data.scores.reduce((sum, snapshot) => sum + number(snapshot.totalScore), 0);
    return (total / data.scores.length).toFixed(1);
  }, [data.scores]);

  const topColumns = [
    {
      key: 'company',
      label: 'Top Company',
      sortable: false,
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.company?.ticker}</p>
          <p className="text-xs text-slate-500">{row.company?.name}</p>
        </div>
      ),
    },
    {
      key: 'sector',
      label: 'Sector',
      sortable: false,
      render: (row) => row.company?.sector || '—',
    },
    {
      key: 'totalScore',
      label: 'Score',
      sortable: false,
      render: (row) => <ScoreBadge score={row.totalScore} />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card title="Dashboard" subtitle="Synthetic market intelligence overview. Not financial advice.">
        {loading && <LoadingState message="Loading dashboard metrics..." details="Aggregating companies, relationships, signals, and latest score snapshots." />}
        {!loading && error && <ErrorState message={error} onAction={loadDashboard} />}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tracked Companies" value={data.companies.length} helper="Universe coverage" accent="blue" />
            <StatCard label="Active Signals" value={data.signals.length} helper="Latest 200 events" accent="emerald" />
            <StatCard label="Relationships" value={data.relationships.length} helper="Directed relationship edges" accent="amber" />
            <StatCard label="Average Top Score" value={avgScore} helper="Across top-ranked snapshots" accent="slate" />
          </div>
        )}
      </Card>

      <Card title="Top Ranked Companies" subtitle="Latest score snapshots">
        {loading && <LoadingState message="Loading top score table..." />}
        {!loading && error && <ErrorState message={error} onAction={loadDashboard} />}
        {!loading && !error && data.scores.length === 0 && (
          <EmptyState
            message="No score snapshots are available."
            details="Run `npm --workspace backend run scores:recompute` after seeding to generate daily snapshots."
          />
        )}
        {!loading && !error && data.scores.length > 0 && <DataTable columns={topColumns} rows={data.scores} keyField="id" />}
      </Card>
    </div>
  );
}
