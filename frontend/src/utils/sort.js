export function compareValues(left, right, direction = 'asc') {
  const a = left ?? '';
  const b = right ?? '';

  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }

  const result = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  return direction === 'asc' ? result : -result;
}

export function nextSortState(currentKey, currentDirection, nextKey) {
  if (currentKey !== nextKey) {
    return { sortKey: nextKey, sortDirection: 'asc' };
  }
  return { sortKey: nextKey, sortDirection: currentDirection === 'asc' ? 'desc' : 'asc' };
}
