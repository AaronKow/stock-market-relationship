import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { apiFetch } from '../api/client';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch('/dashboard/summary')
      .then((payload) => active && setData(payload))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card title="Dashboard" subtitle="Overview of market relationships and latest events.">
      {loading && <LoadingState message="Loading summary..." />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && !data && <EmptyState message="No dashboard summary available." />}
      {!loading && data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data).map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-100 p-4">
              <p className="text-xs uppercase text-slate-500">{label.replaceAll('_', ' ')}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
