import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';

export default function SignalsPage() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch('/signals')
      .then((payload) => active && setSignals(Array.isArray(payload) ? payload : []))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const columns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'type', label: 'Type' },
    { key: 'strength', label: 'Strength' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <Card title="Signals" subtitle="Trading and relationship signals across watch universe.">
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && signals.length === 0 && <EmptyState message="No signals available." />}
      {!loading && !error && signals.length > 0 && <DataTable columns={columns} rows={signals} keyField="id" />}
    </Card>
  );
}
