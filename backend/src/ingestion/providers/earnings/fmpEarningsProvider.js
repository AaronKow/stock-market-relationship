function createFmpEarningsProvider() {
  const apiKey = process.env.FMP_API_KEY;

  return {
    name: 'fmp-earnings',
    source: 'Financial Modeling Prep',
    entityType: 'earnings',
    disabledReason: 'FMP_API_KEY not configured',
    minIntervalMs: 300,
    isEnabled() {
      return Boolean(apiKey);
    },
    async fetchPage({ cursor = null }) {
      if (!apiKey) {
        return {
          records: [],
          rawPayloads: [],
          hasMore: false,
          nextCursor: cursor,
        };
      }

      // Paid provider integration intentionally minimal until env credentials are present.
      return {
        records: [],
        rawPayloads: [],
        hasMore: false,
        nextCursor: cursor,
      };
    },
  };
}

module.exports = {
  createFmpEarningsProvider,
};
