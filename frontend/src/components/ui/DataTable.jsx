function SortIndicator({ active, direction }) {
  if (!active) {
    return <span className="text-slate-300">↕</span>;
  }
  return <span className="text-slate-600">{direction === 'asc' ? '↑' : '↓'}</span>;
}

export default function DataTable({
  columns,
  rows,
  keyField = 'id',
  sortKey,
  sortDirection = 'asc',
  onSort,
  emptyMessage = 'No rows to display.',
}) {
  if (!rows.length) {
    return <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.sortable === false || !onSort ? (
                  column.label
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-left hover:text-slate-800"
                    onClick={() => onSort(column.key)}
                  >
                    <span>{column.label}</span>
                    <SortIndicator active={sortKey === column.key} direction={sortDirection} />
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row[keyField]} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-slate-700">
                  {column.render ? column.render(row) : row[column.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
