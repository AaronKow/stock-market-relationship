import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import SignalsTable from '../components/tables/SignalsTable';
import Card from '../components/ui/Card';
import FilterControls from '../components/ui/FilterControls';
import StatCard from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { compareValues, nextSortState } from '../utils/sort';

export default function SignalsPage() {
  const [signals, setSignals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');
  const [companyId, setCompanyId] = useState('ALL');
  const [sentiment, setSentiment] = useState('ALL');
  const [signalType, setSignalType] = useState('ALL');
  const [sortKey, setSortKey] = useState('occurredAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([apiFetch('/signals?limit=250'), apiFetch('/companies')])
      .then(([signalPayload, companyPayload]) => {
        if (!active) {
          return;
        }
        setSignals(Array.isArray(signalPayload) ? signalPayload : []);
        setCompanies(Array.isArray(companyPayload) ? companyPayload : []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const signalTypes = useMemo(() => ['ALL', ...new Set(signals.map((signal) => signal.signalType).filter(Boolean))], [signals]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return signals.filter((signal) => {
      const byCompany = companyId === 'ALL' || signal.companyId === companyId;
      const bySentiment = sentiment === 'ALL' || signal.sentiment === sentiment;
      const byType = signalType === 'ALL' || signal.signalType === signalType;
      const byQuery =
        !normalized ||
        `${signal.headline || ''} ${signal.description || ''} ${signal.company?.ticker || ''} ${signal.company?.name || ''}`
          .toLowerCase()
          .includes(normalized);

      return byCompany && bySentiment && byType && byQuery;
    });
  }, [signals, query, companyId, sentiment, signalType]);

  const sorted = useMemo(() => {
    const rows = [...filtered];
    rows.sort((left, right) => {
      if (sortKey === 'confidence') {
        return compareValues(Number(left.confidence) || 0, Number(right.confidence) || 0, sortDirection);
      }
      return compareValues(left[sortKey] || '', right[sortKey] || '', sortDirection);
    });
    return rows;
  }, [filtered, sortDirection, sortKey]);

  const positiveCount = filtered.filter((signal) => signal.sentiment === 'POSITIVE').length;
  const negativeCount = filtered.filter((signal) => signal.sentiment === 'NEGATIVE').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Signals" value={filtered.length} helper="Filtered event count" accent="blue" />
        <StatCard label="Positive" value={positiveCount} helper="Bullish sentiment events" accent="emerald" />
        <StatCard label="Negative" value={negativeCount} helper="Risk sentiment events" accent="amber" />
      </div>

      <Card title="Signals" subtitle="Research feed only. Verify all events independently.">
        <FilterControls searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search headline, ticker, or description">
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
          >
            <option value="ALL">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.ticker}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={sentiment}
            onChange={(event) => setSentiment(event.target.value)}
          >
            <option value="ALL">All sentiment</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NEGATIVE">Negative</option>
          </select>

          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={signalType}
            onChange={(event) => setSignalType(event.target.value)}
          >
            {signalTypes.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? 'All types' : value}
              </option>
            ))}
          </select>
        </FilterControls>

        {loading && <LoadingState message="Loading signal events..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && sorted.length === 0 && <EmptyState message="No signals match current filters." />}
        {!loading && !error && sorted.length > 0 && (
          <SignalsTable
            rows={sorted}
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
