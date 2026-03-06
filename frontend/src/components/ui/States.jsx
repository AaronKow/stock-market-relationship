export function LoadingState({ message = 'Loading data…' }) {
  return <p className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">{message}</p>;
}

export function ErrorState({ message = 'Something went wrong.' }) {
  return <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{message}</p>;
}

export function EmptyState({ message = 'No data available yet.' }) {
  return <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">{message}</p>;
}
