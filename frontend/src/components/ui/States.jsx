function StateShell({ tone = 'slate', title, message }) {
  const tones = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <div className={`rounded-xl border px-4 py-5 text-sm ${tones[tone] || tones.slate}`}>
      {title && <p className="font-semibold">{title}</p>}
      <p className={title ? 'mt-1' : ''}>{message}</p>
    </div>
  );
}

export function LoadingState({ message = 'Loading data...' }) {
  return <StateShell tone="blue" title="Loading" message={message} />;
}

export function ErrorState({ message = 'Something went wrong while loading this section.' }) {
  return <StateShell tone="rose" title="Error" message={message} />;
}

export function EmptyState({ message = 'No data available yet.' }) {
  return <StateShell tone="slate" title="No Data" message={message} />;
}
