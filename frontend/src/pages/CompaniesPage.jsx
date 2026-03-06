import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');
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

  const filtered = useMemo(
    () => companies.filter((company) => `${company.name} ${company.symbol}`.toLowerCase().includes(query.toLowerCase())),
    [companies, query],
  );

  const columns = [
    {
      key: 'name',
      label: 'Company',
      render: (row) => <Link className="text-brand-600 hover:underline" to={`/companies/${row.id}`}>{row.name}</Link>,
    },
    { key: 'symbol', label: 'Symbol' },
    { key: 'sector', label: 'Sector' },
    { key: 'market_cap', label: 'Market Cap' },
  ];

  return (
    <Card title="Companies" subtitle="Browse and inspect tracked companies.">
      <FilterBar>
        <input
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Filter by company name or symbol"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </FilterBar>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && filtered.length === 0 && <EmptyState message="No companies match your filter." />}
      {!loading && !error && filtered.length > 0 && <DataTable columns={columns} rows={filtered} />}
    </Card>
  );
}
