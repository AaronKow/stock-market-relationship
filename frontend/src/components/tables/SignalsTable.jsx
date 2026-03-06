import DataTable from '../ui/DataTable';
import SignalBadge from '../ui/SignalBadge';

function formatDate(value) {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export default function SignalsTable({ rows, sortKey, sortDirection, onSort }) {
  const columns = [
    {
      key: 'occurredAt',
      label: 'Timestamp',
      render: (row) => formatDate(row.occurredAt),
    },
    {
      key: 'company',
      label: 'Company',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.company?.ticker || '—'}</p>
          <p className="text-xs text-slate-500">{row.company?.name || 'Unknown Company'}</p>
        </div>
      ),
      sortable: false,
    },
    {
      key: 'signalType',
      label: 'Type',
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      render: (row) => <SignalBadge sentiment={row.sentiment} />,
    },
    {
      key: 'confidence',
      label: 'Confidence',
      render: (row) => `${Math.round((Number(row.confidence) || 0) * 100)}%`,
    },
    {
      key: 'headline',
      label: 'Headline',
      sortable: false,
      render: (row) => row.headline || row.description || '—',
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
      emptyMessage="No signals available for current filters."
    />
  );
}
