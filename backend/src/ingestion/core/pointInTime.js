function normalizePointInTime({ occurredAt = null, publishedAt = null, availableAt = null, fallbackAvailableAt = null } = {}) {
  const normalizedOccurredAt = occurredAt ? new Date(occurredAt) : null;
  const normalizedPublishedAt = publishedAt ? new Date(publishedAt) : null;

  let normalizedAvailableAt = availableAt ? new Date(availableAt) : null;
  if (!normalizedAvailableAt) {
    normalizedAvailableAt = normalizedPublishedAt || (fallbackAvailableAt ? new Date(fallbackAvailableAt) : null);
  }

  if (normalizedPublishedAt && normalizedAvailableAt && normalizedAvailableAt < normalizedPublishedAt) {
    normalizedAvailableAt = normalizedPublishedAt;
  }

  return {
    occurredAt: normalizedOccurredAt,
    publishedAt: normalizedPublishedAt,
    availableAt: normalizedAvailableAt,
  };
}

function isRecordAvailableAsOf(record, asOfDate) {
  const asOf = asOfDate instanceof Date ? asOfDate : new Date(asOfDate);

  const sourceAvailableAt = record.sourceAvailableAt ? new Date(record.sourceAvailableAt) : null;
  if (sourceAvailableAt && sourceAvailableAt > asOf) {
    return false;
  }

  if (record.occurredAt && new Date(record.occurredAt) > asOf) {
    return false;
  }

  return true;
}

module.exports = {
  normalizePointInTime,
  isRecordAvailableAsOf,
};
