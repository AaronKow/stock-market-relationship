import { useMemo, useState } from 'react';
import Card from '../ui/Card';
import ScoreBadge from '../ui/ScoreBadge';
import { EmptyState } from '../ui/States';

export default function WatchlistPanel({ watchlist, companies, onAddCompany, onRemoveItem, isMutating = false }) {
  const [companySearch, setCompanySearch] = useState('');
  const [itemSort, setItemSort] = useState('addedAt:desc');

  const selectableCompanies = useMemo(() => {
    const normalized = companySearch.trim().toLowerCase();
    if (!normalized) {
      return companies;
    }

    return companies.filter((company) =>
      `${company.ticker} ${company.name} ${company.sector || ''}`.toLowerCase().includes(normalized),
    );
  }, [companies, companySearch]);

  const sortedItems = useMemo(() => {
    const [sortKey, sortDirection] = itemSort.split(':');
    const factor = sortDirection === 'asc' ? 1 : -1;
    const rows = [...watchlist.items];

    rows.sort((left, right) => {
      if (sortKey === 'score') {
        const leftScore = Number(left.company?.latestScore?.totalScore) || 0;
        const rightScore = Number(right.company?.latestScore?.totalScore) || 0;
        return (leftScore - rightScore) * factor;
      }

      if (sortKey === 'ticker') {
        const leftTicker = left.company?.ticker || '';
        const rightTicker = right.company?.ticker || '';
        return leftTicker.localeCompare(rightTicker) * factor;
      }

      return (new Date(left.addedAt).getTime() - new Date(right.addedAt).getTime()) * factor;
    });

    return rows;
  }, [itemSort, watchlist.items]);

  return (
    <Card
      title={watchlist.name}
      subtitle={watchlist.description || 'No description provided.'}
      action={
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {watchlist.items.length} items
        </span>
      }
    >
      <form
        className="mb-4 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const companyId = String(formData.get('companyId') || '');
          const notes = String(formData.get('notes') || '');
          if (!companyId) {
            return;
          }
          onAddCompany(companyId, notes);
          event.currentTarget.reset();
        }}
      >
        <label className="min-w-[220px] flex-1 text-xs text-slate-600">
          Search universe
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={companySearch}
            onChange={(event) => setCompanySearch(event.target.value)}
            placeholder="Filter available companies by ticker or name"
            disabled={isMutating}
          />
        </label>

        <label className="min-w-[220px] flex-1 text-xs text-slate-600">
          Company
          <select
            name="companyId"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            defaultValue=""
            required
            disabled={isMutating}
          >
            <option value="" disabled>
              Select a company
            </option>
            {selectableCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.ticker} - {company.name}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-[220px] flex-1 text-xs text-slate-600">
          Notes
          <input
            name="notes"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            placeholder="Optional note"
            disabled={isMutating}
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isMutating || companies.length === 0 || selectableCompanies.length === 0}
        >
          Add
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        <label className="text-xs text-slate-600">
          Sort items
          <select
            className="ml-2 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-700"
            value={itemSort}
            onChange={(event) => setItemSort(event.target.value)}
            disabled={isMutating}
          >
            <option value="addedAt:desc">Recently added</option>
            <option value="addedAt:asc">Oldest added</option>
            <option value="score:desc">Score high to low</option>
            <option value="score:asc">Score low to high</option>
            <option value="ticker:asc">Ticker A-Z</option>
          </select>
        </label>
      </div>

      {companies.length === 0 && <EmptyState message="All tracked companies are already in this watchlist." />}
      {companies.length > 0 && selectableCompanies.length === 0 && (
        <EmptyState
          message="No available companies match your universe search."
          actionLabel="Clear search"
          onAction={() => setCompanySearch('')}
        />
      )}

      <div className="space-y-3">
        {sortedItems.length === 0 && <EmptyState message="No items in this watchlist yet. Add companies from the form above." />}
        {sortedItems.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-medium text-slate-900">{item.company?.ticker} - {item.company?.name}</p>
              <p className="text-xs text-slate-500">{item.company?.sector || 'No sector'}</p>
              {item.notes && <p className="mt-1 text-sm text-slate-600">{item.notes}</p>}
            </div>

            <div className="flex items-center gap-2">
              <ScoreBadge score={item.company?.latestScore?.totalScore || 0} label="Model" />
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                disabled={isMutating}
                onClick={() => onRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
