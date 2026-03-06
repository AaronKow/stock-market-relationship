import Card from '../ui/Card';
import ScoreBadge from '../ui/ScoreBadge';

export default function WatchlistPanel({ watchlist, companies, onAddCompany, onRemoveItem, isMutating = false }) {
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
            {companies.map((company) => (
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
          disabled={isMutating || companies.length === 0}
        >
          Add
        </button>
      </form>

      {companies.length === 0 && (
        <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          All tracked companies are already in this watchlist.
        </p>
      )}

      <div className="space-y-3">
        {watchlist.items.map((item) => (
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
