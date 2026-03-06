function safeDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value) {
  const date = safeDate(value);
  return date ? date.toLocaleDateString() : '—';
}

export function formatDateTime(value) {
  const date = safeDate(value);
  return date ? date.toLocaleString() : '—';
}
