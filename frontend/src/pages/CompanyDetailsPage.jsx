import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, apiPost } from '../api/client';
import SignalsTable from '../components/tables/SignalsTable';
import Card from '../components/ui/Card';
import ScoreBadge from '../components/ui/ScoreBadge';
import ScoreExplanationPanel from '../components/ui/ScoreExplanationPanel';
import StatCard from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { compareValues, nextSortState } from '../utils/sort';

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [signals, setSignals] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [sentiment, setSentiment] = useState('ALL');
  const [sortKey, setSortKey] = useState('occurredAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [companyPayload, signalPayload, relationshipPayload] = await Promise.all([
        apiFetch(`/companies/${id}`),
        apiFetch(`/signals?companyId=${id}&limit=50`),
        apiFetch(`/relationships?companyId=${id}`),
      ]);
      setCompany(companyPayload || null);
      setSignals(Array.isArray(signalPayload) ? signalPayload : []);
      setRelationships(Array.isArray(relationshipPayload) ? relationshipPayload : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleFetchLatestData = async () => {
    setRefreshing(true);
    setError('');

    try {
      await apiPost('/ingestion/run', { companyId: id });
      await loadDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const sortedSignals = useMemo(() => {
    const rows = signals.filter((signal) => sentiment === 'ALL' || signal.sentiment === sentiment);
    rows.sort((left, right) => {
      if (sortKey === 'confidence') {
        return compareValues(Number(left.confidence) || 0, Number(right.confidence) || 0, sortDirection);
      }
      return compareValues(left[sortKey] || '', right[sortKey] || '', sortDirection);
    });
    return rows;
  }, [signals, sentiment, sortDirection, sortKey]);

  if (loading) {
    return <LoadingState message="Loading company details..." details="Fetching score snapshot, relationships, and latest 50 signal events." />;
  }

  if (error) {
    return <ErrorState message={error} onAction={loadDetails} />;
  }

  if (!company) {
    return <EmptyState message="Company details are unavailable." actionLabel="Retry" onAction={loadDetails} />;
  }

  return (
    <div className="space-y-6">
      <Card
        title={`${company.ticker} - ${company.name}`}
        subtitle="Company fundamentals and signal context"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFetchLatestData}
              disabled={refreshing}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? 'Fetching...' : 'Fetch Latest Data'}
            </button>
            <ScoreBadge score={company.latestScore?.totalScore || 0} label="Total" />
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Sector" value={company.sector || 'N/A'} helper={company.industry || 'No industry'} accent="blue" />
          <StatCard label="Exchange" value={company.exchange || 'N/A'} helper={company.country || 'No country'} accent="emerald" />
          <StatCard label="Signals (50)" value={signals.length} helper="Recent company-specific events" accent="amber" />
          <StatCard label="Relationships" value={relationships.length} helper="Connected graph edges" accent="slate" />
        </div>
      </Card>

      <ScoreExplanationPanel snapshot={company.latestScore} />

      <Card
        title="Recent Signals"
        subtitle="Sortable company signal feed"
        action={
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
              value={sentiment}
              onChange={(event) => setSentiment(event.target.value)}
            >
              <option value="ALL">All sentiment</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
              value={`${sortKey}:${sortDirection}`}
              onChange={(event) => {
                const [key, direction] = event.target.value.split(':');
                setSortKey(key);
                setSortDirection(direction);
              }}
            >
              <option value="occurredAt:desc">Newest first</option>
              <option value="occurredAt:asc">Oldest first</option>
              <option value="confidence:desc">Confidence high-low</option>
              <option value="confidence:asc">Confidence low-high</option>
            </select>
          </div>
        }
      >
        {sortedSignals.length === 0 ? (
          <EmptyState
            message="No recent signals for this company."
            details="Try changing sentiment filter to view available events."
            actionLabel="Reset sentiment"
            onAction={() => setSentiment('ALL')}
          />
        ) : (
          <SignalsTable
            rows={sortedSignals}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={(key) => {
              const next = nextSortState(sortKey, sortDirection, key);
              setSortKey(next.sortKey);
              setSortDirection(next.sortDirection);
            }}
          />
        )}
      </Card>
    </div>
  );
}
