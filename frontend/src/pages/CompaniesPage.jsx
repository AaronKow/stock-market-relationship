import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
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
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch('/companies')
      .then((payload) => active && setCompanies(Array.isArray(payload) ? payload : []))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const sectors = useMemo(() => {
    const distinct = new Set(companies.map((company) => company.sector).filter(Boolean));
    return ['ALL', ...Array.from(distinct).sort()];
  }, [companies]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return companies.filter((company) => {
      const bySector = sector === 'ALL' || company.sector === sector;
      const byQuery =
        !normalized ||
        `${company.name} ${company.ticker} ${company.industry || ''}`.toLowerCase().includes(normalized);
      return bySector && byQuery;
    });
  }, [companies, query, sector]);

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

      <Card title="Companies" subtitle="Search, filter, and sort tracked companies.">
        <FilterControls
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search by ticker, name, or industry"
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
        </FilterControls>

        {loading && <LoadingState message="Loading companies..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && sorted.length === 0 && <EmptyState message="No companies match current filters." />}
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
