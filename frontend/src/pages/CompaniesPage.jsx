import { useEffect, useMemo, useState } from 'react';
import { apiFetch, apiPost } from '../api/client';
import CompanyTable from '../components/tables/CompanyTable';
import FilterControls from '../components/ui/FilterControls';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { compareValues, nextSortState } from '../utils/sort';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('ALL');
  const [minimumScore, setMinimumScore] = useState('ALL');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createError, setCreateError] = useState('');
  const [tickerInput, setTickerInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [sectorInput, setSectorInput] = useState('');
  const [exchangeInput, setExchangeInput] = useState('');
  const [countryInput, setCountryInput] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/companies');
      setCompanies(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleAddCompany = async (event) => {
    event.preventDefault();
    setCreateError('');

    const ticker = tickerInput.trim().toUpperCase();
    if (!ticker) {
      setCreateError('Ticker is required.');
      return;
    }

    setCreating(true);
    try {
      await apiPost('/companies', {
        ticker,
        name: nameInput.trim() || undefined,
        sector: sectorInput.trim() || undefined,
        exchange: exchangeInput.trim() || undefined,
        country: countryInput.trim() || undefined,
      });

      setTickerInput('');
      setNameInput('');
      setSectorInput('');
      setExchangeInput('');
      setCountryInput('');
      await loadCompanies();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const sectors = useMemo(() => {
    const distinct = new Set(companies.map((company) => company.sector).filter(Boolean));
    return ['ALL', ...Array.from(distinct).sort()];
  }, [companies]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return companies.filter((company) => {
      const bySector = sector === 'ALL' || company.sector === sector;
      const score = Number(company.latestScore?.totalScore) || 0;
      const byScore = minimumScore === 'ALL' || score >= Number(minimumScore);
      const byQuery =
        !normalized ||
        `${company.name} ${company.ticker} ${company.industry || ''}`.toLowerCase().includes(normalized);
      return bySector && byQuery && byScore;
    });
  }, [companies, minimumScore, query, sector]);

  const sorted = useMemo(() => {
    const rows = [...filtered];

    rows.sort((left, right) => {
      if (sortKey === 'score') {
        return compareValues(left.latestScore?.totalScore || 0, right.latestScore?.totalScore || 0, sortDirection);
      }
      if (sortKey === 'updated') {
        return compareValues(left.latestScore?.snapshotDate || '', right.latestScore?.snapshotDate || '', sortDirection);
      }
      return compareValues(left[sortKey] || '', right[sortKey] || '', sortDirection);
    });

    return rows;
  }, [filtered, sortDirection, sortKey]);

  const rankedCount = useMemo(() => companies.filter((company) => company.latestScore).length, [companies]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Companies" value={companies.length} helper="Total tracked companies" accent="blue" />
        <StatCard label="Sectors" value={Math.max(0, sectors.length - 1)} helper="Distinct industries represented" accent="emerald" />
        <StatCard label="Scored" value={rankedCount} helper="Companies with model snapshot" accent="amber" />
      </div>

      <Card
        title="Companies"
        subtitle="Search, filter, and sort tracked companies."
        action={
          <form onSubmit={handleAddCompany} className="flex w-full flex-wrap items-center justify-end gap-2 xl:w-auto">
            <input
              value={tickerInput}
              onChange={(event) => setTickerInput(event.target.value)}
              placeholder="Ticker (e.g. NVDA)"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
            />
            <input
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="Name (optional)"
              className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
            />
            <input
              value={sectorInput}
              onChange={(event) => setSectorInput(event.target.value)}
              placeholder="Sector"
              className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
            />
            <input
              value={exchangeInput}
              onChange={(event) => setExchangeInput(event.target.value)}
              placeholder="Exchange"
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
            />
            <input
              value={countryInput}
              onChange={(event) => setCountryInput(event.target.value)}
              placeholder="Country"
              className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Adding...' : 'Add Company'}
            </button>
          </form>
        }
      >
        {createError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{createError}</div>
        )}
        <FilterControls
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search by ticker, name, or industry"
          rightContent={
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => {
                setQuery('');
                setSector('ALL');
                setMinimumScore('ALL');
                setSortKey('name');
                setSortDirection('asc');
              }}
            >
              Reset filters
            </button>
          }
        >
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
          >
            {sectors.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? 'All sectors' : value}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={minimumScore}
            onChange={(event) => setMinimumScore(event.target.value)}
          >
            <option value="ALL">Any score</option>
            <option value="80">Score 80+</option>
            <option value="60">Score 60+</option>
            <option value="40">Score 40+</option>
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
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="score:desc">Score (High-Low)</option>
            <option value="score:asc">Score (Low-High)</option>
            <option value="updated:desc">Snapshot (Newest)</option>
            <option value="updated:asc">Snapshot (Oldest)</option>
          </select>
        </FilterControls>

        {loading && <LoadingState message="Loading companies..." details="Fetching company fundamentals and latest score snapshots." />}
        {!loading && error && <ErrorState message={error} onAction={loadCompanies} />}
        {!loading && !error && sorted.length === 0 && (
          <EmptyState
            message="No companies match current filters."
            details="Try a broader query, a different sector, or remove the minimum score filter."
            actionLabel="Reset filters"
            onAction={() => {
              setQuery('');
              setSector('ALL');
              setMinimumScore('ALL');
            }}
          />
        )}
        {!loading && !error && sorted.length > 0 && (
          <CompanyTable
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
