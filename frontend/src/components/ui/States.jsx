function StateShell({ tone = 'slate', title, message, details, actionLabel, onAction }) {
  const tones = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <div className={`rounded-xl border px-4 py-5 text-sm ${tones[tone] || tones.slate}`}>
      {title && <p className="font-semibold">{title}</p>}
      <p className={title ? 'mt-1' : ''}>{message}</p>
      {details && <p className="mt-2 text-xs opacity-80">{details}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          className="mt-3 rounded-md border border-current px-2.5 py-1.5 text-xs font-medium"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingState({ message = 'Loading data...', details }) {
  return <StateShell tone="blue" title="Loading" message={message} details={details} />;
}

export function ErrorState({
  message = 'Something went wrong while loading this section.',
  details,
  actionLabel = 'Retry',
  onAction,
}) {
  return <StateShell tone="rose" title="Error" message={message} details={details} actionLabel={actionLabel} onAction={onAction} />;
}

export function EmptyState({ message = 'No data available yet.', details, actionLabel, onAction }) {
  return <StateShell tone="slate" title="No Data" message={message} details={details} actionLabel={actionLabel} onAction={onAction} />;
}
