import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import WatchlistPanel from '../components/watchlist/WatchlistPanel';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';

async function postJson(path, body) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newWatchlistDescription, setNewWatchlistDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [watchlistPayload, companyPayload] = await Promise.all([apiFetch('/watchlists'), apiFetch('/companies')]);

    const watchlistRows = Array.isArray(watchlistPayload) ? watchlistPayload : [];
    const companyRows = Array.isArray(companyPayload) ? companyPayload : [];

    setWatchlists(watchlistRows);
    setCompanies(companyRows);

    if (!selectedId && watchlistRows.length > 0) {
      setSelectedId(watchlistRows[0].id);
    }

    if (selectedId && !watchlistRows.some((watchlist) => watchlist.id === selectedId)) {
      setSelectedId(watchlistRows[0]?.id || '');
    }
  };

  useEffect(() => {
    let active = true;

    load()
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const companyById = useMemo(() => new Map(companies.map((company) => [company.id, company])), [companies]);

  const hydratedWatchlists = useMemo(
    () =>
      watchlists.map((watchlist) => ({
        ...watchlist,
        items: watchlist.items.map((item) => ({
          ...item,
          company: {
            ...item.company,
            latestScore: companyById.get(item.companyId || item.company?.id)?.latestScore || null,
          },
        })),
      })),
    [watchlists, companyById],
  );

  const selectedWatchlist = hydratedWatchlists.find((watchlist) => watchlist.id === selectedId) || hydratedWatchlists[0] || null;

  const availableCompanies = useMemo(() => {
    if (!selectedWatchlist) {
      return companies;
    }
    const existing = new Set(selectedWatchlist.items.map((item) => item.companyId || item.company?.id));
    return companies.filter((company) => !existing.has(company.id));
  }, [companies, selectedWatchlist]);

  const handleCreateWatchlist = async (event) => {
    event.preventDefault();
    if (!newWatchlistName.trim()) {
      return;
    }

    setMutating(true);
    setError('');

    try {
      const created = await postJson('/watchlists', {
        name: newWatchlistName.trim(),
        description: newWatchlistDescription.trim() || null,
      });

      setWatchlists((prev) => [...prev, created]);
      setSelectedId(created.id);
      setNewWatchlistName('');
      setNewWatchlistDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const handleAddItem = async (companyId, notes) => {
    if (!selectedWatchlist) {
      return;
    }

    setMutating(true);
    setError('');

    try {
      await postJson(`/watchlists/${selectedWatchlist.id}/items`, {
        companyId,
        notes: notes || null,
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!selectedWatchlist) {
      return;
    }

    setMutating(true);
    setError('');

    try {
      await apiFetch(`/watchlists/${selectedWatchlist.id}/items/${itemId}`, {
        method: 'DELETE',
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMutating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading watchlists..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Watchlists" value={watchlists.length} helper="Saved list groups" accent="blue" />
        <StatCard
          label="Tracked Items"
          value={watchlists.reduce((sum, watchlist) => sum + watchlist.items.length, 0)}
          helper="Companies across all watchlists"
          accent="emerald"
        />
        <StatCard label="Available Universe" value={companies.length} helper="Total selectable companies" accent="amber" />
      </div>

      <Card title="Create Watchlist" subtitle="Build custom collections for monitoring.">
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleCreateWatchlist}>
          <label className="min-w-[220px] flex-1 text-xs text-slate-600">
            Name
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
              value={newWatchlistName}
              onChange={(event) => setNewWatchlistName(event.target.value)}
              placeholder="e.g. Event-driven ideas"
              required
              disabled={mutating}
            />
          </label>

          <label className="min-w-[220px] flex-1 text-xs text-slate-600">
            Description
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
              value={newWatchlistDescription}
              onChange={(event) => setNewWatchlistDescription(event.target.value)}
              placeholder="Optional description"
              disabled={mutating}
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={mutating}
          >
            Create
          </button>
        </form>
      </Card>

      <Card
        title="Watchlists"
        subtitle="Manage synthetic watchlist items via internal APIs."
        action={
          watchlists.length > 0 ? (
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
              value={selectedWatchlist?.id || ''}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {watchlists.map((watchlist) => (
                <option key={watchlist.id} value={watchlist.id}>
                  {watchlist.name}
                </option>
              ))}
            </select>
          ) : null
        }
      >
        {error && <ErrorState message={error} />}
        {!error && !selectedWatchlist && <EmptyState message="No watchlists found. Create one above." />}
        {!error && selectedWatchlist && (
          <WatchlistPanel
            watchlist={selectedWatchlist}
            companies={availableCompanies}
            onAddCompany={handleAddItem}
            onRemoveItem={handleRemoveItem}
            isMutating={mutating}
          />
        )}
      </Card>
    </div>
  );
}
