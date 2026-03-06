import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
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
  const [sortKey, setSortKey] = useState('occurredAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([apiFetch(`/companies/${id}`), apiFetch(`/signals?companyId=${id}&limit=50`), apiFetch(`/relationships?companyId=${id}`)])
      .then(([companyPayload, signalPayload, relationshipPayload]) => {
        if (!active) {
          return;
        }
        setCompany(companyPayload || null);
        setSignals(Array.isArray(signalPayload) ? signalPayload : []);
        setRelationships(Array.isArray(relationshipPayload) ? relationshipPayload : []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const sortedSignals = useMemo(() => {
    const rows = [...signals];
    rows.sort((left, right) => {
      if (sortKey === 'confidence') {
        return compareValues(Number(left.confidence) || 0, Number(right.confidence) || 0, sortDirection);
      }
      return compareValues(left[sortKey] || '', right[sortKey] || '', sortDirection);
    });
    return rows;
  }, [signals, sortDirection, sortKey]);

  if (loading) {
    return <LoadingState message="Loading company details..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!company) {
    return <EmptyState message="Company details are unavailable." />;
  }

  return (
    <div className="space-y-6">
      <Card
        title={`${company.ticker} - ${company.name}`}
        subtitle="Company fundamentals and signal context"
        action={<ScoreBadge score={company.latestScore?.totalScore || 0} label="Total" />}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Sector" value={company.sector || 'N/A'} helper={company.industry || 'No industry'} accent="blue" />
          <StatCard label="Exchange" value={company.exchange || 'N/A'} helper={company.country || 'No country'} accent="emerald" />
          <StatCard label="Signals (50)" value={signals.length} helper="Recent company-specific events" accent="amber" />
          <StatCard label="Relationships" value={relationships.length} helper="Connected graph edges" accent="slate" />
        </div>
      </Card>

      <ScoreExplanationPanel snapshot={company.latestScore} />

      <Card title="Recent Signals" subtitle="Sortable company signal feed">
        {sortedSignals.length === 0 ? (
          <EmptyState message="No recent signals for this company." />
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
