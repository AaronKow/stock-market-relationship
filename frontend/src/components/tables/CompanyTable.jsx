import { Link } from 'react-router-dom';
import DataTable from '../ui/DataTable';
import ScoreBadge from '../ui/ScoreBadge';

function formatDate(value) {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleDateString();
}

export default function CompanyTable({ rows, sortKey, sortDirection, onSort }) {
  const columns = [
    {
      key: 'name',
      label: 'Company',
      render: (row) => (
        <div>
          <Link className="font-medium text-blue-700 hover:underline" to={`/companies/${row.id}`}>
            {row.name}
          </Link>
          <p className="text-xs text-slate-500">{row.ticker}</p>
        </div>
      ),
    },
    {
      key: 'sector',
      label: 'Sector',
      render: (row) => row.sector || '—',
    },
    {
      key: 'score',
      label: 'Score',
      render: (row) => <ScoreBadge score={row.latestScore?.totalScore || 0} />,
    },
    {
      key: 'updated',
      label: 'Last Snapshot',
      render: (row) => formatDate(row.latestScore?.snapshotDate),
      sortValue: (row) => row.latestScore?.snapshotDate || '',
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      keyField="id"
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyMessage="No companies available."
    />
  );
}
