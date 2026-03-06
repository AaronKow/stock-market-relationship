import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import Card from '../components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch(`/companies/${id}`)
      .then((payload) => active && setCompany(payload))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <Card title={`Company Details #${id}`} subtitle="Fundamentals and related relationship insights.">
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && !company && <EmptyState message="Company details unavailable." />}
      {!loading && company && (
        <dl className="grid gap-4 sm:grid-cols-2">
          {Object.entries(company).map(([key, value]) => (
            <div key={key} className="rounded-md bg-slate-100 p-3">
              <dt className="text-xs uppercase text-slate-500">{key.replaceAll('_', ' ')}</dt>
              <dd className="text-sm text-slate-800">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
