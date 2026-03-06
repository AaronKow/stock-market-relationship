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
  const [minimumConfidence, setMinimumConfidence] = useState('ALL');
  const [sortKey, setSortKey] = useState('occurredAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSignals = async () => {
    setLoading(true);
    setError('');
    try {
      const [signalPayload, companyPayload] = await Promise.all([apiFetch('/signals?limit=250'), apiFetch('/companies')]);
      setSignals(Array.isArray(signalPayload) ? signalPayload : []);
      setCompanies(Array.isArray(companyPayload) ? companyPayload : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, []);

  const signalTypes = useMemo(() => ['ALL', ...new Set(signals.map((signal) => signal.signalType).filter(Boolean))], [signals]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return signals.filter((signal) => {
      const byCompany = companyId === 'ALL' || signal.companyId === companyId;
      const bySentiment = sentiment === 'ALL' || signal.sentiment === sentiment;
      const byType = signalType === 'ALL' || signal.signalType === signalType;
      const byConfidence = minimumConfidence === 'ALL' || (Number(signal.confidence) || 0) >= Number(minimumConfidence);
      const byQuery =
        !normalized ||
        `${signal.headline || ''} ${signal.description || ''} ${signal.company?.ticker || ''} ${signal.company?.name || ''}`
          .toLowerCase()
          .includes(normalized);

      return byCompany && bySentiment && byType && byConfidence && byQuery;
    });
  }, [signals, query, companyId, sentiment, signalType, minimumConfidence]);

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
        <FilterControls
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search headline, ticker, or description"
          rightContent={
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => {
                setQuery('');
                setCompanyId('ALL');
                setSentiment('ALL');
                setSignalType('ALL');
                setMinimumConfidence('ALL');
                setSortKey('occurredAt');
                setSortDirection('desc');
              }}
            >
              Reset filters
            </button>
          }
        >
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
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={minimumConfidence}
            onChange={(event) => setMinimumConfidence(event.target.value)}
          >
            <option value="ALL">Any confidence</option>
            <option value="0.8">80%+</option>
            <option value="0.6">60%+</option>
            <option value="0.4">40%+</option>
          </select>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={`${sortKey}:${sortDirection}`}
            onChange={(event) => {
              const [key, direction] = event.target.value.split(':');
              setSortKey(key);
              setSortDirection(direction);
            }}
          >
            <option value="occurredAt:desc">Time (Newest)</option>
            <option value="occurredAt:asc">Time (Oldest)</option>
            <option value="confidence:desc">Confidence (High-Low)</option>
            <option value="confidence:asc">Confidence (Low-High)</option>
            <option value="signalType:asc">Type (A-Z)</option>
          </select>
        </FilterControls>

        {loading && <LoadingState message="Loading signal events..." details="Pulling the latest event feed and company metadata." />}
        {!loading && error && <ErrorState message={error} onAction={loadSignals} />}
        {!loading && !error && sorted.length === 0 && (
          <EmptyState
            message="No signals match current filters."
            details="Try broader sentiment/type filters or reduce the confidence threshold."
            actionLabel="Reset filters"
            onAction={() => {
              setCompanyId('ALL');
              setSentiment('ALL');
              setSignalType('ALL');
              setMinimumConfidence('ALL');
              setQuery('');
            }}
          />
        )}
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
